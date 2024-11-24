import React, { useState } from 'react';
import {
  Users, BookOpen, Phone, History, CreditCard, Key, 
  Webhook, Menu, X, ChevronDown, Plus, Search
} from 'lucide-react';

const CompactDashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation - Always visible on mobile */}
      <nav className="bg-white border-b border-gray-200 fixed top-0 w-full z-30">
        <div className="px-4 h-14 flex items-center justify-between">
          {/* Mobile menu button */}
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <span className="font-semibold hidden sm:inline">VoiceAgent AI</span>
          </div>

          {/* Workspace Selector */}
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 text-sm">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white">E</span>
              </div>
              <span className="hidden sm:inline">Eva Super...</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar - Collapsible on mobile */}
      <div className={`fixed inset-y-0 left-0 transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 transition-transform duration-200 ease-in-out z-20`}>
        <div className="w-64 h-full bg-white border-r border-gray-200 pt-14">
          {/* Navigation Items */}
          <nav className="p-4 space-y-1">
            <NavItem icon={<Users />} label="Agents" active />
            <NavItem icon={<BookOpen />} label="Knowledge Base" />
            <NavItem icon={<Phone />} label="Phone Numbers" />
            <NavItem icon={<History />} label="Call History" />
            <NavItem icon={<CreditCard />} label="Billing" />
            <NavItem icon={<Key />} label="API Keys" />
            <NavItem icon={<Webhook />} label="Webhooks" />
          </nav>

          {/* Trial Status - Fixed at bottom */}
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
        </div>
      </div>

      {/* Main Content */}
      <main className={`pt-14 ${isSidebarOpen ? 'lg:ml-64' : ''} transition-margin duration-200 ease-in-out`}>
        {/* Header */}
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

        {/* Empty State */}
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
      </main>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 lg:hidden z-10"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

// Navigation Item Component
const NavItem = ({ icon, label, active = false }) => (
  <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer ${
    active ? 'bg-gray-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
  }`}>
    {React.cloneElement(icon, { className: 'w-5 h-5' })}
    <span className="text-sm font-medium">{label}</span>
  </div>
);

export default CompactDashboard;