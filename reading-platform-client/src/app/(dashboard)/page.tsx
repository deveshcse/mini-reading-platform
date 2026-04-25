import React from "react";

export default function StoryFeedPage() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Story Feed</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder for story cards */}
          <div className="h-64 border-2 border-dashed border-muted-foreground/20 rounded-xl flex items-center justify-center text-muted-foreground">
            Story cards will appear here...
          </div>
          <div className="h-64 border-2 border-dashed border-muted-foreground/20 rounded-xl flex items-center justify-center text-muted-foreground">
            Story cards will appear here...
          </div>
          <div className="h-64 border-2 border-dashed border-muted-foreground/20 rounded-xl flex items-center justify-center text-muted-foreground">
            Story cards will appear here...
          </div>
        </div>
      </div>
    </div>
  );
}
