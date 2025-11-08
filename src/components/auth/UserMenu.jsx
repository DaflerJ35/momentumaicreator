import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { logout } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Cog6ToothIcon, ArrowRightOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function UserMenu() {
  const { currentUser } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!currentUser) return null;

  return (
    <Menu as="div" className="relative ml-4">
      <div>
        <Menu.Button className="flex rounded-full bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900">
          <span className="sr-only">Open user menu</span>
          {currentUser.photoURL ? (
            <img
              className="h-8 w-8 rounded-full"
              src={currentUser.photoURL}
              alt={currentUser.displayName || 'User'}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white">
              {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-xl bg-slate-800 shadow-lg ring-1 ring-black/5 focus:outline-none p-1">
          <div className="px-4 py-3 border-b border-slate-700">
            <p className="text-sm text-white font-medium">{currentUser.displayName || 'User'}</p>
            <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
          </div>
          
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <Link
                  to="/settings"
                  className={`${
                    active ? 'bg-slate-700 text-white' : 'text-slate-300'
                  } group flex w-full items-center rounded-lg px-3 py-2 text-sm`}
                >
                  <UserCircleIcon className="mr-3 h-5 w-5 text-slate-400" aria-hidden="true" />
                  Profile
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link
                  to="/settings"
                  className={`${
                    active ? 'bg-slate-700 text-white' : 'text-slate-300'
                  } group flex w-full items-center rounded-lg px-3 py-2 text-sm`}
                >
                  <Cog6ToothIcon className="mr-3 h-5 w-5 text-slate-400" aria-hidden="true" />
                  Settings
                </Link>
              )}
            </Menu.Item>
          </div>
          
          <div className="py-1 border-t border-slate-700">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleSignOut}
                  className={`${
                    active ? 'bg-slate-700 text-white' : 'text-slate-300'
                  } group flex w-full items-center rounded-lg px-3 py-2 text-sm`}
                >
                  <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-slate-400" aria-hidden="true" />
                  Sign out
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
