import React from "react";

export default function StoryDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-4 uppercase">Story Detail</h1>
        <p className="text-muted-foreground mb-8">Story ID: {params.id}</p>
        
        <div className="prose prose-slate max-w-none">
          <div className="h-96 border-2 border-dashed border-muted-foreground/20 rounded-xl flex items-center justify-center text-muted-foreground">
            Story content will be rendered here...
          </div>
        </div>
      </div>
    </div>
  );
}
