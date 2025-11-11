import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCursorTracking } from '../hooks/useCursorTracking';
import CollaborationCursor from './CollaborationCursor';
import { useAuth } from '../contexts/AuthContext';

/**
 * Wrapper component that enables cursor tracking and renders collaboration cursors
 * This should be added to pages that need live cursor tracking
 */
const CursorTrackingWrapper = ({ children, enableTracking = true }) => {
  const location = useLocation();
  const { currentUser } = useAuth();

  // Enable cursor tracking if user is logged in
  useCursorTracking(enableTracking && !!currentUser, 100);

  return (
    <>
      {children}
      {/* Render collaboration cursors for the current page */}
      {enableTracking && currentUser && (
        <CollaborationCursor pageId={location.pathname} />
      )}
    </>
  );
};

export default CursorTrackingWrapper;

