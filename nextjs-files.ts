// package.json
{
  "name": "voice-agent-dashboard",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "lucide-react": "^0.284.0",
    "next": "13.5.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.8.2",
    "@types/react": "^18.2.24",
    "@types/react-dom": "^18.2.8",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.50.0",
    "eslint-config-next": "13.5.4",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.3",
    "typescript": "^5.2.2"
  }
}

// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}

// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VoiceAgent AI Dashboard',
  description: 'Manage your AI voice agents efficiently',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

// src/app/page.tsx
import Dashboard from '@/components/Dashboard';

export default function Home() {
  return <Dashboard />;
}

// src/app/globals.css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-rgb: 245, 245, 245;
}

body {
  color: rgb(var(--foreground-rgb));
  background: rgb(var(--background-rgb));
}

// src/components/Dashboard.tsx
'use client';

import { SidebarProvider } from '@/context/SidebarContext';
import Sidebar from './Sidebar';
import Header from './Header';
import MainContent from './MainContent';
import MobileNav from './MobileNav';

export default function Dashboard() {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50">
        <MobileNav />
        <Sidebar />
        <main className="lg:ml-64 transition-margin duration-200 ease-in-out">
          <Header />
          <MainContent />
        </main>
      </div>
    </SidebarProvider>
  );
}

// src/components/Header.tsx
'use client';

import { Search, Plus } from 'lucide-react';

export default function Header() {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Agents</h1>
        <div className="flex items-center space-x-4">
          <div className="hidden sm:block relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search agents..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Agent</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// src/components/MainContent.tsx
'use client';

import { Users, Plus } from 'lucide-react';

export default function MainContent() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-lg border border-gray-200 p-6">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-medium text-center mb-2">You don't have any agents yet</h2>
        <p className="text-gray-500 text-center mb-4">Create your first AI agent to get started</p>
        <button className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Create an Agent</span>
        </button>
      </div>
    </div>
  );
}

// src/components/MobileNav.tsx
'use client';

import { Menu, X, ChevronDown } from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';

export default function MobileNav() {
  const { isOpen, toggle } = useSidebar();

  return (
    <nav className="bg-white border-b border-gray-200 fixed top-0 w-full z-30">
      <div className="px-4 h-14 flex items-center justify-between">
        <button 
          onClick={toggle}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <span className="font-semibold hidden sm:inline">VoiceAgent AI</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white">E</span>
          </div>
          <span className="hidden sm:inline">Eva Super...</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    </nav>
  );
}

// src/components/NavItem.tsx
'use client';

interface NavItemProps {
  icon: React.ReactElement;
  label: string;
  active?: boolean;
}

export default function NavItem({ icon, label, active = false }: NavItemProps) {
  return (
    <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer ${
      active ? 'bg-gray-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
    }`}>
      {React.cloneElement(icon, { className: 'w-5 h-5' })}
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

// src/components/Sidebar.tsx
'use client';

import { useSidebar } from '@/context/SidebarContext';
import { Users, BookOpen, Phone, History, CreditCard, Key, Webhook } from 'lucide-react';
import NavItem from './NavItem';
import TrialStatus from './TrialStatus';

export default function Sidebar() {
  const { isOpen } = useSidebar();
  
  return (
    <div className={`fixed inset-y-0 left-0 transform ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0 transition-transform duration-200 ease-in-out z-20`}>
      <div className="w-64 h-full bg-white border-r border-gray-200 pt-14">
        <nav className="p-4 space-y-1">
          <NavItem icon={<Users />} label="Agents" active />
          <NavItem icon={<BookOpen />} label="Knowledge Base" />
          <NavItem icon={<Phone />} label="Phone Numbers" />
          <NavItem icon={<History />} label="Call History" />
          <NavItem icon={<CreditCard />} label="Billing" />
          <NavItem icon={<Key />} label="API Keys" />
          <NavItem icon={<Webhook />} label="Webhooks" />
        </nav>
        <TrialStatus />
      </div>
    </div>
  );
}

// src/components/TrialStatus.tsx
'use client';

export default function TrialStatus() {
  return (
    <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 bg-white">
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Free Trial</span>
            <span>60:00 min</span>
          </div>
          <div className="mt-2 h-1 bg-gray-200 rounded">
            <div className="h-1 bg-blue-600 rounded w-1/2"></div>
          </div>
        </div>
        <button className="w-full px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-900">
          Add Payment
        </button>
      </div>
    </div>
  );
}

// src/context/SidebarContext.tsx
'use client';

import { createContext, useContext, useState } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SidebarContext.Provider 
      value={{
        isOpen,
        toggle: () => setIsOpen(!isOpen),
        close: () => setIsOpen(false)
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
};

// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;

// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
