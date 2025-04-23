
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ChatBot } from '@/components/chat/ChatBot';

export default function CareerAssistantPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar userRole="student" />
      <main className="container mx-auto px-4 py-8 mt-16">
        <h1 className="text-2xl font-bold text-center mb-6">Career Assistant</h1>
        <ChatBot />
      </main>
      <Footer />
    </div>
  );
}
