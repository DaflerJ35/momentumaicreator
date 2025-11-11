import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
      <div className="space-y-4">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-3xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
}
