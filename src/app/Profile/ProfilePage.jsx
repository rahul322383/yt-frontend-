"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  Lock,
  ShieldCheck,
  Link2,
  Heart,
  Code,
  Mail,
  Globe,
  MapPin,
  User,
  Calendar,
} from "lucide-react";
import API from "../../utils/axiosInstance";

// Components
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/Input";
import Label from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import AvatarUpload from "../components/common/AvatarUpload";
import CoverUpload from "../components/common/Cover";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  bio: z.string().max(160).optional(),
  location: z.string().max(50).optional(),
  website: z.string().url().or(z.literal("")).optional(),
  avatar: z.string().optional(),
  coverImage: z.string().optional(),
});

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
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
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get("/users/me");
        setProfile(data.data);
        reset(data.data);
      } catch (error) {
        toast.error("Failed to fetch profile data");
        console.error("Profile fetch error:", error);
      }
    };
    fetchProfile();
  }, [reset, refreshKey]);

  const onSubmit = async (values) => {
    try {
      const { data } = await API.put("/users/update-account", values);
      toast.success("Profile updated successfully");
      setProfile(data.data);
      setEditingField(null);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const handleFieldEdit = (field) => {
    setEditingField(editingField === field ? null : field);
  };

  const handleAvatarUpload = (url) => {
    setValue("avatar", url);
    setRefreshKey((prev) => prev + 1);
    toast.success("Avatar uploaded successfully");
  };

  const handleCoverUpload = (url) => {
    setValue("coverImage", url);
    setRefreshKey((prev) => prev + 1);
    toast.success("Cover photo updated");
  };

  const fieldIcons = {
    name: <User className="w-4 h-4 mr-2" />,
    email: <Mail className="w-4 h-4 mr-2" />,
    website: <Globe className="w-4 h-4 mr-2" />,
    location: <MapPin className="w-4 h-4 mr-2" />,
    bio: <span className="w-4 h-4 mr-2">📝</span>,
    username: <span className="w-4 h-4 mr-2">@</span>,
  };

  const tabIcons = {
    profile: <ShieldCheck className="w-4 h-4 mr-2" />,
    social: <Link2 className="w-4 h-4 mr-2" />,
    interests: <Heart className="w-4 h-4 mr-2" />,
    skills: <Code className="w-4 h-4 mr-2" />,
  };

  return (
    <div className="w-full px-4 py-6 max-w-7xl mx-auto">
      <Tabs defaultValue="profile" className="w-full">
        {/* Enhanced Tabs with better styling */}
        <TabsList className="grid w-full grid-cols-2 sm:flex gap-2 bg-muted/50 p-1.5 rounded-xl mb-6 backdrop-blur-sm border">
          {["profile", "social", "interests", "skills"].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="py-2 px-4 text-sm font-medium transition-all capitalize
                data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg
                data-[state=active]:text-primary hover:text-foreground/80
                flex items-center justify-center gap-1.5"
            >
              {tabIcons[tab]}
              <span>{tab}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {/* Profile Card with improved layout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border shadow-sm rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm">
              {/* Cover Image with gradient overlay */}
              <div className="w-full px-4 sm:px-12 md:px-20 lg:px-32 xl:px-60">
  <CoverUpload
    key={`cover-${refreshKey}`}
    coverUrl={profile?.coverImage}
    onUpload={handleCoverUpload}
  />
</div>

              
              <div className="relative px-4 sm:px-6">
                {/* Avatar with better positioning */}
                <div className="flex -mt-16 sm:-mt-20 z-10">
                  <AvatarUpload
                    key={`avatar-${refreshKey}`}
                    avatarUrl={profile?.avatar} 
                    onUpload={handleAvatarUpload}
                    className="border-4 border-background rounded-full shadow-lg"
                  />
                </div>

                <CardHeader className="pb-4 pt-6 px-0">
                  <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">
                    {profile?.name || "Your Profile"}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base text-muted-foreground">
                    {profile?.bio || "Tell us about yourself"}
                  </CardDescription>
                </CardHeader>
                
                <Separator className="mb-6 bg-border/50" />
                
                <CardContent className="px-0">
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                      <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                        {["name", "username", "email", "bio", "location", "website"].map((field) => (
                          <div key={field} className="grid grid-cols-1 sm:grid-cols-4 items-start gap-3 sm:gap-4">
                            <Label 
                              htmlFor={field} 
                              className="sm:text-right capitalize sm:col-span-1 pt-2 text-sm font-medium flex items-center text-muted-foreground"
                            >
                              {fieldIcons[field]}
                              <span className="hidden sm:inline">{field}</span>
                            </Label>
                            <div className="sm:col-span-2 space-y-1">
                              {field === "bio" ? (
                                <textarea
                                  id={field}
                                  {...register(field)}
                                  defaultValue={watch(field) || ""}
                                  readOnly={editingField !== field}
                                  className={`w-full min-h-[100px] rounded-lg border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all ${
                                    editingField === field ? 'ring-2 ring-primary bg-background shadow-sm' : 'bg-muted/20'
                                  } ${!watch(field) ? 'text-muted-foreground italic' : ''}`}
                                  placeholder={!watch(field) ? `Add your ${field}...` : ''}
                                />
                              ) : (
                                <Input
                                  id={field}
                                  {...register(field)}
                                  defaultValue={watch(field) || ""}
                                  readOnly={editingField !== field}
                                  className={`rounded-lg transition-all ${
                                    editingField === field ? 'ring-2 ring-primary bg-background shadow-sm' : 'bg-muted/20'
                                  } ${!watch(field) ? 'text-muted-foreground italic' : ''}`}
                                  placeholder={!watch(field) ? `Add your ${field}...` : ''}
                                />
                              )}
                              {errors[field] && (
                                <p className="text-sm text-destructive mt-1">
                                  {errors[field].message}
                                </p>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant={editingField === field ? "secondary" : "outline"}
                              size="sm"
                              onClick={() => handleFieldEdit(field)}
                              className="sm:col-span-1 w-full sm:w-auto h-9"
                            >
                              {editingField === field ? "Cancel" : watch(field) ? "Edit" : "Add"}
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Right sidebar with stats */}
                      <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                        {/* Stats Card with glass effect */}
                        <Card className="border shadow-sm rounded-xl bg-background/50 backdrop-blur-sm">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                              <ShieldCheck className="w-5 h-5 text-primary" />
                              Profile Stats
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                              <span className="text-sm text-muted-foreground flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                Member since
                              </span>
                              <span className="text-sm font-medium">
                                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                              <span className="text-sm text-muted-foreground">
                                Last updated
                              </span>
                              <span className="text-sm font-medium">
                                {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                              <span className="text-sm text-muted-foreground">
                                Profile views
                              </span>
                              <span className="text-sm font-medium">
                                {profile?.views || "0"}
                              </span>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Verification Status */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Account Status
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            <Badge 
                              variant={profile?.verified ? "default" : "outline"} 
                              className="text-xs sm:text-sm px-3 py-1 rounded-lg"
                            >
                              {profile?.verified ? (
                                <span className="flex items-center gap-1.5">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  Verified
                                </span>
                              ) : "Not Verified"}
                            </Badge>
                            <Badge 
                              variant={profile?.twoFactorEnabled ? "default" : "outline"} 
                              className="text-xs sm:text-sm px-3 py-1 rounded-lg"
                            >
                              {profile?.twoFactorEnabled ? (
                                <span className="flex items-center gap-1.5">
                                  <Lock className="w-3.5 h-3.5" />
                                  2FA Enabled
                                </span>
                              ) : "2FA Disabled"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </CardContent>
                
                <Separator className="my-4 sm:my-6 bg-border/50" />
                
                <CardFooter className="px-0 pb-0 flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate("/settings")}
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    Back to Settings
                  </Button>
                  <div className="flex gap-3 w-full sm:w-auto order-1 sm:order-2">
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
                          <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          Saving...
                        </span>
                      ) : "Save Changes"}
                    </Button>
                  </div>
                </CardFooter>
              </div>
            </Card>
          </motion.div>

          {/* Security Card with modern styling */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="border shadow-sm rounded-xl bg-background/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Lock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">
                      Security
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Manage your account security settings
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <Separator className="mb-4 sm:mb-6 bg-border/50" />
              
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <Button 
                    variant="outline" 
                    className="w-full h-20 sm:h-24 flex-col gap-1.5 sm:gap-2 rounded-xl hover:bg-muted/50 transition-all"
                    onClick={() => navigate("/reset-password")}
                  >
                    <div className="p-2.5 rounded-full bg-primary/10">
                      <Lock className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm sm:text-base font-medium">Reset Password</span>
                    <span className="text-xs text-muted-foreground">Set a new password</span>
                  </Button>
                  <Button 
                    variant="default" 
                    className="w-full h-20 sm:h-24 flex-col gap-1.5 sm:gap-2 rounded-xl bg-primary hover:bg-primary/90 transition-all"
                    onClick={() => navigate("/forget-password")}
                  >
                    <div className="p-2.5 rounded-full bg-background/20">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="text-sm sm:text-base font-medium">Two-Factor Auth</span>
                    <span className="text-xs text-background/80">
                      {profile?.twoFactorEnabled ? "Manage 2FA" : "Enable 2FA"}
                    </span>
                  </Button>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                    <div>
                      <Label className="text-sm font-medium">Last Login</Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {profile?.lastLogin ? new Date(profile.lastLogin).toLocaleString() : "Never"}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs sm:text-sm rounded-lg">
                      {profile?.ipAddress || "IP: Unknown"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                    <div>
                      <Label className="text-sm font-medium">Active Sessions</Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {profile?.activeSessions || "0"} devices
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                      View all
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Other tabs with consistent styling */}
        {["social", "interests", "skills"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border shadow-sm rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      {React.cloneElement(tabIcons[tab], { className: "w-5 h-5 text-primary" })}
                    </div>
                    <div>
                      <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight capitalize">
                        {tab}
                      </CardTitle>
                      <CardDescription className="text-sm sm:text-base">
                        {tab === "social" && "Connect your social media accounts"}
                        {tab === "interests" && "Manage your interests and preferences"}
                        {tab === "skills" && "Showcase your professional skills"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12 sm:py-16 gap-4 sm:gap-5">
                    <div className="bg-muted/50 p-4 sm:p-5 rounded-full border">
                      {React.cloneElement(tabIcons[tab], { className: "w-8 h-8 sm:w-10 sm:h-10" })}
                    </div>
                    <p className="text-muted-foreground text-center max-w-md mx-auto text-sm sm:text-base">
                      {tab === "social" && "Connect your social accounts to share your profile and grow your network"}
                      {tab === "interests" && "Add your interests to get personalized content recommendations"}
                      {tab === "skills" && "Highlight your professional skills to showcase your expertise"}
                    </p>
                    <Button variant="outline" className="mt-2 sm:mt-4 rounded-lg">
                      Coming Soon
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}