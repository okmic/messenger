import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

export const Layout = () => {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Message App</h1>
      <MessageList />
      <MessageInput />
    </div>
  );
};