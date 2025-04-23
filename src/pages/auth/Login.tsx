
import { Link } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function Login() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-platformBlue hover:text-platformBlue-dark">
                Sign up
              </Link>
            </p>
          </div>
          
          <div className="bg-white p-8 shadow-sm rounded-lg">
            <LoginForm />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
