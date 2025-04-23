
import { Link } from 'react-router-dom';
import { SignupForm } from '@/components/auth/SignupForm';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function Signup() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create your account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-platformBlue hover:text-platformBlue-dark">
                Log in
              </Link>
            </p>
          </div>
          
          <div className="bg-white p-8 shadow-sm rounded-lg">
            <SignupForm />
          </div>
          
          <p className="text-xs text-center text-gray-500 mt-8">
            By signing up, you agree to our{' '}
            <Link to="/terms" className="text-platformBlue hover:text-platformBlue-dark">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-platformBlue hover:text-platformBlue-dark">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
