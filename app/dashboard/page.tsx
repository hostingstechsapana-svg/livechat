import UserChat from "@/components/chat/user-chat";

export default function Dashboard() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">User Dashboard</h1>
      <UserChat />
    </div>
  );
}