import { useEffect } from 'react';

function Navigate({ to }: { to: string }) {
  useEffect(() => {
    window.location.href = to;  // Redirect the user to the target location
  }, [to]);

  return null;
}

export default Navigate;