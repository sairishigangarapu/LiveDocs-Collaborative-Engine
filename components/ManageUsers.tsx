'use client'
import React, { FormEvent, useState, useTransition, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { inviteUserToDocument, removeUserFromDocument, getRoomUsers } from '@/actions/actions'
import { toast } from 'sonner'
import { Input } from './ui/input'
import { useRoom, useSelf } from '@liveblocks/react/suspense'
import useOwner from '@/lib/useOwner'

interface RoomUser {
  email: string;
  name: string;
  avatar: string;
  role: "owner" | "editor";
}

function ManageUsers() {
  const self = useSelf();
  const room = useRoom();
  const isOwner = useOwner()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [usersInRoom, setUsersInRoom] = useState<RoomUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const pathname = usePathname()

  const currentUserEmail = self?.info?.email || ''

  // Fetch users function - gets all user data from Firestore
  const fetchUsers = useCallback(async () => {
    if (!room?.id) {
      console.log('⚠️ No room ID, skipping fetch')
      return
    }
    
    setLoadingUsers(true)
    console.log('📡 [CLIENT] Fetching users for room:', room.id)
    
    try {
      // Get user information and roles from Firestore
      const result = await getRoomUsers(room.id)
      console.log('📦 [CLIENT] getRoomUsers result:', JSON.stringify(result, null, 2))
      
      if (result.success && result.users) {
        console.log('📊 [CLIENT] Raw users from server:', result.users.length)
        console.log('📊 [CLIENT] Raw users data:', JSON.stringify(result.users, null, 2))
        
        // Map Firestore users to our RoomUser interface
        const users: RoomUser[] = result.users.map(user => ({
          email: user.email || user.userId,
          name: user.name || user.email?.split('@')[0] || user.userId.split('@')[0] || 'Unknown',
          avatar: user.avatar || '',
          role: user.role
        }))
        
        console.log('📊 [CLIENT] Mapped users:', users.length)
        console.log('👥 [CLIENT] Mapped users data:', JSON.stringify(users, null, 2))
        
        setUsersInRoom(users)
        console.log('✅ [CLIENT] Users loaded successfully:', users.length, 'users')
      } else {
        console.error('❌ [CLIENT] Failed to fetch users:', result.error)
        console.error('❌ [CLIENT] Result was:', result)
        setUsersInRoom([])
      }
    } catch (error) {
      console.error('❌ [CLIENT] Error fetching users:', error)
      console.error('❌ [CLIENT] Error details:', error instanceof Error ? error.message : 'Unknown')
      setUsersInRoom([])
    } finally {
      setLoadingUsers(false)
      console.log('🏁 [CLIENT] Users loading complete')
    }
  }, [room?.id])

  // Debug log
  useEffect(() => {
    console.log('🔍 ManageUsers Debug:', {
      isOwner,
      currentUserEmail,
      roomId: room?.id,
      usersCount: usersInRoom.length,
      selfInfo: self?.info
    })
  }, [isOwner, currentUserEmail, room?.id, usersInRoom.length, self])

  // Fetch users when dialog opens
  useEffect(() => {
    if (isOpen && room?.id) {
      console.log('🔄 Users fetch effect triggered:', { isOpen, roomId: room.id })
      fetchUsers()
    }
  }, [isOpen, room?.id, fetchUsers])

  // Render log
  useEffect(() => {
    console.log('🎨 ManageUsers Render:', {
      isOpen,
      isOwner,
      loadingUsers,
      usersInRoom: usersInRoom.length,
      usersData: JSON.stringify(usersInRoom),
      showingNoUsers: !loadingUsers && usersInRoom.length === 0,
      showingUsersList: !loadingUsers && usersInRoom.length > 0
    })
  }, [isOpen, isOwner, loadingUsers, usersInRoom])
  const handleInvite = async(e: FormEvent) => {
    e.preventDefault()

    const roomId = pathname.split('/').pop()
    if (!roomId || !email) return
    
    startTransition(async() => {
      try {
        const result = await inviteUserToDocument(roomId, email)
        if (result.success) {
          setEmail('')
          toast.success("User Added Successfully")
          // Refresh users list
          await fetchUsers()
        } else {
          console.error("Failed to add user:", result.error)
          toast.error(result.error || "Failed To Add User")
        }
      } catch (error) {
        console.error("Unexpected error during user addition:", error)
        toast.error("An unexpected error occurred. Please try again.")
      }
    })
  }

  const handleDelete = async(userEmail: string) => {
    const roomId = pathname.split('/').pop()
    if (!roomId) return

    startTransition(async() => {
      try {
        const result = await removeUserFromDocument(roomId, userEmail)
        if (result.success) {
          toast.success("User removed successfully")
          // Refresh users list
          await fetchUsers()
        } else {
          toast.error(result.error || "Failed to remove user")
        }
      } catch (error) {
        console.error("Error removing user:", error)
        toast.error("An unexpected error occurred")
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button asChild variant='outline' className='mr-10'>
        <DialogTrigger>Users ({usersInRoom.length})</DialogTrigger>
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Users with access</DialogTitle>
          <DialogDescription>
            Below is a list of users who have access to this document
          </DialogDescription>
        </DialogHeader>
        
        <hr className='my-2'/>
        
        {/* Debug: Refresh button */}
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              console.log('🔄 [CLIENT] Manual refresh triggered')
              fetchUsers()
            }}
            disabled={loadingUsers}
          >
            🔄 Refresh Users
          </Button>
        </div>
        
        {/* Users List */}
        <div className="flex flex-col space-y-2">
          {loadingUsers ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">Loading users...</p>
            </div>
          ) : usersInRoom.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">No users with access yet</p>
            </div>
          ) : (
            usersInRoom.map((user) => {
              const isCurrentUser = user.email === currentUserEmail
              
              console.log('👤 Rendering user:', {
                userEmail: user.email,
                userName: user.name,
                currentUserEmail,
                isCurrentUser,
                match: user.email === currentUserEmail
              })
              
              return (
                <div 
                  key={user.email}
                  className="flex items-center justify-between border-b pb-3"
                >
                  <div className="flex items-center gap-3">
                    {user.avatar && (
                      <Image 
                        src={user.avatar} 
                        alt={user.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-medium">
                        {user.name}
                        {isCurrentUser && " (You)"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {user.email}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {user.role}
                      </p>
                    </div>
                  </div>
                  
                  {isOwner && !isCurrentUser && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(user.email)}
                      disabled={isPending}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Invite Form - Only shown to owners */}
        {isOwner && (
          <>
            <hr className='my-2'/>
            <div className='mb-4'>
              <p className="text-sm font-medium mb-2">Invite a user to collaborate</p>
              <form onSubmit={handleInvite} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  required
                />
                <Button type="submit" disabled={isPending || !email}>
                  {isPending ? "Inviting..." : "Invite"}
                </Button>
              </form>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ManageUsers
