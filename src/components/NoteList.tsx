'use client';

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import CaseSummaryButton from './CaseSummaryButton'

interface Note {
  _id: string
  content: string
  visitDate: string
  createdAt: string
}

interface NoteListProps {
  patientId: string
  status: 'open' | 'discharged' | 'closed'
  _id: string
}

export default function NoteList({ patientId, status, _id }: NoteListProps) {
  const { data: session } = useSession()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newNote, setNewNote] = useState('')
  const [editingNote, setEditingNote] = useState<string | null>(null)

  useEffect(() => {
    fetchNotes()
  }, [patientId])

  const fetchNotes = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/notes?patientId=${patientId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch notes')
      }

      const data = await response.json()
      setNotes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.trim()) return

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId,
          content: newNote.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add note')
      }

      const data = await response.json()
      setNotes([data, ...notes])
      setNewNote('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add note')
    }
  }

  const handleUpdateNote = async (id: string, content: string) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          content: content.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update note')
      }

      const data = await response.json()
      setNotes(notes.map(note => 
        note._id === id ? data : note
      ))
      setEditingNote(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update note')
    }
  }

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return
    }

    try {
      const response = await fetch(`/api/notes?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete note')
      }

      setNotes(notes.filter(note => note._id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note')
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>
  }

  return (
    <div className="space-y-6">
      {status === 'open' && (
        <form onSubmit={handleAddNote} className="space-y-4">
          <div>
            <label
              htmlFor="newNote"
              className="block text-sm font-medium text-gray-700"
            >
              Add New Note
            </label>
            <textarea
              id="newNote"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              required
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter your note here..."
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Note
          </button>
        </form>
      )}

      <div className="space-y-4">
        {notes.map((note) => (
          <div
            key={note._id}
            className="bg-white p-4 rounded-lg shadow"
          >
            {editingNote === note._id ? (
              <div className="space-y-4">
                <textarea
                  value={note.content}
                  onChange={(e) => {
                    setNotes(notes.map(n => 
                      n._id === note._id ? { ...n, content: e.target.value } : n
                    ))
                  }}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingNote(null)}
                    className="px-3 py-1 text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateNote(note._id, note.content)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="whitespace-pre-wrap">{note.content}</p>
                <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
                  <span>
                    {new Date(note.visitDate).toLocaleDateString()}
                  </span>
                  {status === 'open' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingNote(note._id)}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note._id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {notes.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No notes yet. {status === 'open' ? 'Add a note to get started.' : ''}
        </div>
      )}

      {status === 'discharged' && notes.length > 0 && (
        <div className="mt-8">
          <CaseSummaryButton caseId={_id} />
        </div>
      )}
    </div>
  )
} 