import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserProfileView from "@/components/profile/UserProfileView";

export default function UserProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your profile and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="social">Social Links</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <UserProfileView />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <p>Settings coming soon...</p>
        </TabsContent>

        <TabsContent value="social" className="mt-6">
          <p>Social links management coming soon...</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
