import { useState, useEffect } from 'react';
import { db } from '../auth/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface User {
  uid: string;
  email: string;
  displayName: string;
}

interface UserSelectorProps {
  onSelectUser: (userId: string) => void;
  currentUserId: string | null;
}

export default function UserSelector({ onSelectUser, currentUserId }: UserSelectorProps) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(usersCollection);
      const userList = userSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
      setUsers(userList);
    };

    fetchUsers();
  }, []);

  return (
    <select
      onChange={(e) => onSelectUser(e.target.value)}
      value={currentUserId || ''}
      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    >
      <option value="">No asignado a nadie</option>
      {users.map((user) => (
        <option key={user.uid} value={user.uid}>
          {user.displayName || user.email}
        </option>
      ))}
    </select>
  );
}

