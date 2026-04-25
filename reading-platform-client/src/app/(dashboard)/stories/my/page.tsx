import React from "react";

export default function MyStoriesPage() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight uppercase">My Stories</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-64 border-2 border-dashed border-muted-foreground/20 rounded-xl flex items-center justify-center text-muted-foreground">
            Your published stories will appear here...
          </div>
        </div>
      </div>
    </div>
  );
}
