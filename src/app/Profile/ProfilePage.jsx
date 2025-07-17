"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import AvatarUpload from "../components/common/AvatarUpload.jsx";
import CoverUpload from "../components/common/ProfileUpload.jsx";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs.jsx";
import ProfileEditModal from "../profile/ProfileEditModel.jsx";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardContent, 
  CardFooter 
} from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/Input.jsx";
import Label from "../components/ui/label.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Separator } from "../components/ui/separator.jsx";
import API from "../../utils/axiosInstance.jsx";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(1, "Username is required"),
  email: z.string().email(),
  bio: z.string().max(160).optional(),
  location: z.string().optional(),
  website: z.string().url().optional(),
  avatar: z.any().optional(),
  coverImage: z.any().optional(),
});

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const navigate = useNavigate();
  
  const {
    register,
    setValue,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      bio: "",
      location: "",
      website: "",
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get("/users/me");
        setProfile(data.data);
        reset(data.data);
      } catch (error) {
        toast.error("Failed to fetch profile data");
      }
    };
    fetchProfile();
  }, [reset]);

  const onSubmit = async (values) => {
    try {
      const { data } = await API.put("/users/update-account", values);
      toast.success("Profile updated successfully");
      setProfile(data.data);
      setEditingField(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const handleFieldEdit = (field) => {
    setEditingField(editingField === field ? null : field);
  };

  const handleAvatarUpload = (url) => {
    setProfile(prev => ({ ...prev, avatar: url }));
    setValue("avatar", url);
  };

  const handleCoverUpload = (url) => {
    setProfile(prev => ({ ...prev, coverImage: url }));
    setValue("coverImage", url);
  };

  return (
    <div className="flex w-full px-4 py-6 max-w-4xl mx-auto space-y-8 sm:px-6 lg:px-8">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 bg-muted p-2 rounded-lg">
          {["profile", "social", "interests", "skills"].map((tab) => (
            <TabsTrigger 
              key={tab}
              value={tab}
              className="py-2 text-sm font-medium transition-all capitalize
                data-[state=active]:bg-background data-[state=active]:text-foreground
                data-[state=active]:shadow-sm rounded-md hover:text-foreground/80"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border shadow-sm rounded-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                  Profile Information
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Update your profile details and images
                </CardDescription>
              </CardHeader>
              
              <Separator className="my-4" />
              
              <CardContent>
                <div className="flex flex-col gap-8 lg:flex-row">
                  <div className="w-full lg:w-1/3 space-y-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-foreground">
                        Profile Picture
                      </Label>
                      <AvatarUpload 
                        avatarUrl={profile?.avatar} 
                        onUpload={handleAvatarUpload}
                        className="mx-auto"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-foreground">
                        Cover Image
                      </Label>
                      <CoverUpload 
                        coverUrl={profile?.coverImage} 
                        onUpload={handleCoverUpload}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <form className="w-full lg:w-2/3 space-y-6">
                    {["name", "username", "email", "bio", "location", "website"].map((field) => (
                      <div key={field} className="grid grid-cols-1 sm:grid-cols-4 items-start gap-4">
                        <Label 
                          htmlFor={field} 
                          className="sm:text-right capitalize sm:col-span-1 pt-2 text-sm font-medium text-foreground"
                        >
                          {field}
                        </Label>
                        <div className="sm:col-span-2 space-y-1">
                          <Input
                            id={field}
                            {...register(field)}
                            defaultValue={watch(field) || ""}
                            className="w-full text-foreground"
                            readOnly={editingField !== field}
                          />
                          {errors[field] && (
                            <p className="text-sm text-destructive">
                              {errors[field].message}
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant={editingField === field ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => handleFieldEdit(field)}
                          className="sm:col-span-1 w-full sm:w-auto"
                        >
                          {editingField === field ? "Cancel" : "Edit"}
                        </Button>
                      </div>
                    ))}
                  </form>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-6">
                  <Badge variant="outline" className="text-muted-foreground">
                    Last updated: {new Date().toLocaleDateString()}
                  </Badge>
                  {profile?.verified && (
                    <Badge variant="default">
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified Account
                      </span>
                    </Badge>
                  )}
                </div>
              </CardContent>
              
              <Separator className="my-6" />
              
              <CardFooter className="pt-6 flex flex-col sm:flex-row justify-between gap-3">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/settings")}
                  className="w-full sm:w-auto text-foreground"
                >
                  Back to Settings
                </Button>
                <div className="flex gap-3 w-full sm:w-auto">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setEditingField(null)}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </span>
                    ) : "Save Changes"}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Security Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="border shadow-sm rounded-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                  Security
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage your account security settings
                </CardDescription>
              </CardHeader>
              
              <Separator className="mb-6" />
              
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    variant="outline" 
                    className="w-full flex-1"
                    onClick={() => navigate("/reset-password")}
                  >
                    Reset Password
                  </Button>
                  <Button 
                    variant="default" 
                    className="w-full flex-1"
                    onClick={() => navigate("/forget-password")}
                  >
                    Update Password
                  </Button>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 pt-4">
                  <Badge variant={profile?.twoFactorEnabled ? "default" : "outline"}>
                    {profile?.twoFactorEnabled ? (
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        2FA Enabled
                      </span>
                    ) : "2FA Disabled"}
                  </Badge>
                  <Badge variant="outline" className="text-muted-foreground">
                    Last login: {new Date().toLocaleString()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Other tabs content */}
        {["social", "interests", "skills"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-6">
            <Card className="border shadow-sm rounded-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold tracking-tight capitalize text-foreground">
                  {tab}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {tab === "social" && "Connect your social media accounts"}
                  {tab === "interests" && "Manage your interests and preferences"}
                  {tab === "skills" && "Showcase your professional skills"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="bg-muted p-4 rounded-full">
                    <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-muted-foreground text-center">
                    {tab.charAt(0).toUpperCase() + tab.slice(1)} features coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}