/* eslint-disable no-unused-vars */

"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
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
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Plus,
  X,
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
import CoverUpload from "../components/common/cover";
import ProgressLabelCard from "../components/ui/progress";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "../components/ui/command";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  bio: z.string().max(160).optional(),
  location: z.string().max(50).optional(),
  website: z.string().url().or(z.literal("")).optional(),
  avatar: z.string().optional(),
  coverImage: z.string().optional(),
  socialLinks: z.object({
    github: z.string().url().or(z.literal("")).optional(),
    twitter: z.string().url().or(z.literal("")).optional(),
    linkedin: z.string().url().or(z.literal("")).optional(),
    instagram: z.string().url().or(z.literal("")).optional(),
  }).optional(),
  skills: z.array(z.object({
    name: z.string(),
    level: z.number().min(0).max(100),
  })).optional(),
  interests: z.array(z.string()).optional(),
});

const allSkills = [
  "JavaScript", "TypeScript", "React", "Next.js", "Node.js",
  "Python", "Django", "Flask", "Java", "Spring Boot",
  "HTML/CSS", "Tailwind CSS", "UI/UX Design", "GraphQL",
  "Docker", "Kubernetes", "AWS", "Git", "SQL", "NoSQL",
  "Machine Learning", "Data Analysis", "Cybersecurity"
];

const allInterests = [
  "Web Development", "Mobile Development", "DevOps",
  "Cloud Computing", "Artificial Intelligence", "Blockchain",
  "Open Source", "UI/UX Design", "Data Science",
  "Cybersecurity", "Game Development", "AR/VR"
];

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState("profile");
  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [skillLevel, setSkillLevel] = useState(50);
  const [isUploading, setIsUploading] = useState(false);
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
      socialLinks: {
        github: "",
        twitter: "",
        linkedin: "",
        instagram: "",
      },
      skills: [],
      interests: [],
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get("/users/me");
        setProfile(data.data);
        reset({
          ...data.data,
          socialLinks: data.data.socialLinks || {
            github: "",
            twitter: "",
            linkedin: "",
            instagram: "",
          },
          skills: data.data.skills || [],
          interests: data.data.interests || [],
        });
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

  const handleAvatarUpload = (avatarUrl) => {
    setValue("avatar", avatarUrl);
    setRefreshKey((prev) => prev + 1);
    // Auto-save when avatar is uploaded
    handleSubmit(onSubmit)();
  };

  const handleAvatarDelete = () => {
    setValue("avatar", null);
    setRefreshKey((prev) => prev + 1);
    // Auto-save when avatar is deleted
    handleSubmit(onSubmit)();
  };

  const handleCoverUpload = (coverUrl) => {
    setValue("coverImage", coverUrl);
    setRefreshKey((prev) => prev + 1);
    // Auto-save when cover is uploaded
    handleSubmit(onSubmit)();
  };

  const addSkill = () => {
    if (newSkill.trim() && !watch("skills")?.some(s => s.name.toLowerCase() === newSkill.toLowerCase())) {
      const currentSkills = watch("skills") || [];
      setValue("skills", [...currentSkills, { name: newSkill, level: skillLevel }]);
      setNewSkill("");
      setSkillLevel(50);
    }
  };

  const removeSkill = (index) => {
    const currentSkills = [...(watch("skills") || [])];
    currentSkills.splice(index, 1);
    setValue("skills", currentSkills);
  };

  const addInterest = () => {
    if (newInterest.trim() && !watch("interests")?.includes(newInterest)) {
      const currentInterests = watch("interests") || [];
      setValue("interests", [...currentInterests, newInterest]);
      setNewInterest("");
    }
  };

  const removeInterest = (interest) => {
    const currentInterests = watch("interests")?.filter(i => i !== interest) || [];
    setValue("interests", currentInterests);
  };

  const fieldIcons = {
    name: <User className="w-4 h-4 mr-2" />,
    email: <Mail className="w-4 h-4 mr-2" />,
    website: <Globe className="w-4 h-4 mr-2" />,
    location: <MapPin className="w-4 h-4 mr-2" />,
    bio: <span className="w-4 h-4 mr-2">📝</span>,
    username: <span className="w-4 h-4 mr-2">@</span>,
  };

  const socialIcons = {
    github: <Github className="w-4 h-4" />,
    twitter: <Twitter className="w-4 h-4" />,
    linkedin: <Linkedin className="w-4 h-4" />,
    instagram: <Instagram className="w-4 h-4" />,
  };

  const tabIcons = {
    profile: <User className="w-4 h-4 mr-2" />,
    social: <Link2 className="w-4 h-4 mr-2" />,
    interests: <Heart className="w-4 h-4 mr-2" />,
    skills: <Code className="w-4 h-4 mr-2" />,
  };

  return (
    <div className="w-full px-4 py-6 max-w-7xl mx-auto">
      <Tabs 
        defaultValue="profile" 
        className="w-full"
        value={activeTab}
        onValueChange={setActiveTab}
      >
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

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border shadow-sm rounded-xl bg-background/50 backdrop-blur-sm overflow-hidden">
              
              {/* Cover Image */}
              <div className="relative w-full h-56 sm:h-64 md:h-72 lg:h-80 bg-gradient-to-r from-primary/10 to-secondary/10">
                <CoverUpload
                  key={`cover-${refreshKey}`}
                  coverUrl={watch("coverImage") || profile?.coverImage}
                  onUpload={handleCoverUpload}
                  className="absolute inset-0 w-full h-full"
                  aspectRatio="16/9"
                  maxSizeMB={5}
                />
              </div>

              {/* Avatar */}
              <div className="relative px-6 -mt-20 sm:-mt-24 z-10 flex items-start">
                <AvatarUpload
                  key={`avatar-${refreshKey}`}
                  avatarUrl={watch("avatar") || profile?.avatar}
                  onUpload={handleAvatarUpload}
                  onDelete={handleAvatarDelete}
                  size="xl"
                  className="border-4 border-background rounded-full shadow-xl"
                />
              </div>

              {/* Profile Info */}
              <CardHeader className="px-6 pt-4 pb-2">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">
                      {watch("name") || profile?.name || "Your Profile"}
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base text-muted-foreground">
                      @{watch("username") || profile?.username || "username"}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 mt-4 sm:mt-0">
                    <Button variant="outline" size="sm" className="rounded-full">
                      Share Profile
                    </Button>
                    <Button size="sm" className="rounded-full">
                      Follow
                    </Button>
                  </div>
                </div>
                <CardDescription className="text-sm sm:text-base text-muted-foreground mt-2">
                  {watch("bio") || profile?.bio || "Tell us about yourself"}
                </CardDescription>
              </CardHeader>

              <Separator className="my-4 bg-border/50" />

              {/* Editable Form */}
              <CardContent className="px-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                    
                    {/* Left: Profile Fields */}
                    <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                      {["name", "username", "email", "bio", "location", "website"].map((field) => (
                        <div key={field} className="grid grid-cols-1 sm:grid-cols-4 items-start gap-3 sm:gap-4">
                          <Label 
                            htmlFor={field} 
                            className="sm:text-right capitalize sm:col-span-1 pt-2 text-sm font-medium flex items-center text-muted-foreground gap-1"
                          >
                            {fieldIcons[field]}
                            <span className="hidden sm:inline">{field}</span>
                          </Label>
                          <div className="sm:col-span-2 space-y-1">
                            {field === "bio" ? (
                              <textarea
                                id={field}
                                {...register(field)}
                                defaultValue={watch(field) || profile?.[field] || ""}
                                readOnly={editingField !== field}
                                className={`w-full min-h-[100px] rounded-lg border border-input px-4 py-2 text-sm transition-all placeholder:text-muted-foreground ${
                                  editingField === field ? 'ring-2 ring-primary bg-background shadow-sm' : 'bg-muted/20'
                                } ${!watch(field) && !profile?.[field] ? 'text-muted-foreground italic' : ''}`}
                                placeholder={!watch(field) && !profile?.[field] ? `Add your ${field}...` : ''}
                              />
                            ) : (
                              <Input
                                id={field}
                                type={field === "email" ? "email" : "text"}
                                {...register(field)}
                                defaultValue={watch(field) || profile?.[field] || ""}
                                readOnly={editingField !== field}
                                className={`rounded-lg transition-all ${
                                  editingField === field ? 'ring-2 ring-primary bg-background shadow-sm' : 'bg-muted/20'
                                } ${!watch(field) && !profile?.[field] ? 'text-muted-foreground italic' : ''}`}
                                placeholder={!watch(field) && !profile?.[field] ? `Add your ${field}...` : ''}
                              />
                            )}
                            {errors[field] && (
                              <p className="text-sm text-destructive mt-1">{errors[field].message}</p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant={editingField === field ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => handleFieldEdit(field)}
                            className="sm:col-span-1 w-full sm:w-auto h-9"
                          >
                            {editingField === field ? "Cancel" : (watch(field) || profile?.[field]) ? "Edit" : "Add"}
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Right: Stats */}
                    <div className="lg:col-span-1 space-y-4 sm:space-y-6">
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
                          <div className="space-y-3">
                            <Label className="text-sm font-medium flex items-center gap-2">
                              <Lock className="w-4 h-4" />
                              Account Status
                            </Label>
                            <Badge variant={profile?.verified ? "default" : "outline"} className="text-xs sm:text-sm px-3 py-1 rounded-lg">
                              {profile?.verified ? "Verified" : "Not Verified"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                  </div>
                  
                  {/* Save Button for Profile Tab */}
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          Saving...
                        </span>
                      ) : "Save Profile"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Security Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="border shadow-sm rounded-xl bg-background/50 backdrop-blur-sm">
              <CardHeader className="pb-4 px-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Lock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">Security</CardTitle>
                    <CardDescription className="text-sm sm:text-base text-muted-foreground">
                      Manage your account security settings
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <Separator className="mb-4 sm:mb-6 bg-border/50" />

              <CardContent className="space-y-4 sm:space-y-6 px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="w-full h-24 flex flex-col items-center justify-center gap-2 rounded-xl hover:bg-muted/50 transition-all"
                    onClick={() => navigate("/reset-password")}
                  >
                    <div className="p-3 rounded-full bg-primary/10 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-base font-semibold">Reset Password</span>
                    <span className="text-sm text-muted-foreground">Set a new password</span>
                  </Button>

                  <Button
                    variant="default"
                    className="w-full h-24 flex flex-col items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 transition-all"
                    onClick={() => navigate("/forget-password")}
                  >
                    <div className="p-3 rounded-full bg-background/20 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-base font-semibold text-background">Two-Factor Auth</span>
                    <span className="text-sm text-background/80">
                      {profile?.twoFactorEnabled ? "Manage 2FA" : "Enable 2FA"}
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border shadow-sm rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Link2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">
                      Social Connections
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Connect your social media accounts
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="space-y-6">
                    {["github", "twitter", "linkedin", "instagram"].map((platform) => (
                      <div key={platform} className="grid grid-cols-1 sm:grid-cols-4 items-start gap-3 sm:gap-4">
                        <Label 
                          htmlFor={`socialLinks.${platform}`} 
                          className="sm:text-right capitalize sm:col-span-1 pt-2 text-sm font-medium flex items-center text-muted-foreground"
                        >
                          {socialIcons[platform]}
                          <span className="hidden sm:inline ml-2">{platform}</span>
                        </Label>
                        <div className="sm:col-span-2 space-y-1">
                          <Input
                            id={`socialLinks.${platform}`}
                            {...register(`socialLinks.${platform}`)}
                            defaultValue={watch(`socialLinks.${platform}`) || profile?.socialLinks?.[platform] || ""}
                            className="rounded-lg bg-muted/20"
                            placeholder={`https://${platform}.com/username`}
                          />
                          {errors.socialLinks?.[platform] && (
                            <p className="text-sm text-destructive mt-1">
                              {errors.socialLinks[platform].message}
                            </p>
                          )}
                        </div>
                        <div className="sm:col-span-1">
                          {watch(`socialLinks.${platform}`) || profile?.socialLinks?.[platform] ? (
                            <Button 
                              type="button"
                              variant="outline" 
                              size="sm" 
                              className="w-full sm:w-auto h-9"
                              onClick={() => window.open(watch(`socialLinks.${platform}`) || profile?.socialLinks?.[platform], '_blank')}
                            >
                              Visit Profile
                            </Button>
                          ) : (
                            <Button 
                              type="button"
                              variant="ghost" 
                              size="sm" 
                              className="w-full sm:w-auto h-9 text-muted-foreground"
                              disabled
                            >
                              Not Connected
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <CardFooter className="flex justify-end px-0 pt-6 pb-0">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          Saving...
                        </span>
                      ) : "Save Social Links"}
                    </Button>
                  </CardFooter>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="interests" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border shadow-sm rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Heart className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">
                      Your Interests
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Add topics you're interested in to personalize your experience
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-3 sm:gap-4">
                      <Label 
                        htmlFor="interests" 
                        className="sm:text-right sm:col-span-1 pt-2 text-sm font-medium flex items-center text-muted-foreground"
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Add Interest</span>
                      </Label>
                      <div className="sm:col-span-2 space-y-1">
                        <div className="flex gap-2">
                          <Command className="rounded-lg border w-full">
                            <CommandInput 
                              placeholder="Search interests..." 
                              value={newInterest}
                              onValueChange={setNewInterest}
                            />
                            <CommandList>
                              <CommandEmpty>No interests found.</CommandEmpty>
                              <CommandGroup>
                                {allInterests
                                  .filter(i => !watch("interests")?.includes(i))
                                  .filter(i => i.toLowerCase().includes(newInterest.toLowerCase()))
                                  .map((interest) => (
                                    <CommandItem 
                                      key={interest}
                                      onSelect={() => {
                                        setNewInterest(interest);
                                        addInterest();
                                      }}
                                      className="cursor-pointer"
                                    >
                                      {interest}
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                          <Button 
                            type="button" 
                            onClick={addInterest}
                            disabled={!newInterest.trim()}
                            className="h-10"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="sm:col-span-1">
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm" 
                          className="w-full sm:w-auto h-9"
                          onClick={() => setActiveTab("profile")}
                        >
                          Back to Profile
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <AnimatePresence>
                        {watch("interests")?.map((interest) => (
                          <motion.div
                            key={interest}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Badge 
                              variant="outline" 
                              className="px-3 py-1 rounded-full text-sm flex items-center gap-1.5"
                            >
                              {interest}
                              <button 
                                type="button"
                                onClick={() => removeInterest(interest)}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </Badge>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                  <CardFooter className="flex justify-end px-0 pt-6 pb-0">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          Saving...
                        </span>
                      ) : "Save Interests"}
                    </Button>
                  </CardFooter>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border shadow-sm rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Code className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">
                      Your Skills
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Showcase your professional skills and expertise
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-3 sm:gap-4">
                      <Label 
                        htmlFor="skills" 
                        className="sm:text-right sm:col-span-1 pt-2 text-sm font-medium flex items-center text-muted-foreground"
                      >
                        <Code className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Add Skill</span>
                      </Label>
                      <div className="sm:col-span-3 space-y-2">
                        <div className="flex gap-2">
                          <Command className="rounded-lg border w-full">
                            <CommandInput 
                              placeholder="Search skills..." 
                              value={newSkill}
                              onValueChange={setNewSkill}
                            />
                            <CommandList>
                              <CommandEmpty>No skills found.</CommandEmpty>
                              <CommandGroup>
                                {allSkills
                                  .filter(s => !watch("skills")?.some(skill => skill.name.toLowerCase() === s.toLowerCase()))
                                  .filter(s => s.toLowerCase().includes(newSkill.toLowerCase()))
                                  .map((skill) => (
                                    <CommandItem 
                                      key={skill}
                                      onSelect={() => {
                                        setNewSkill(skill);
                                      }}
                                      className="cursor-pointer"
                                    >
                                      {skill}
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <ProgressLabelCard value={skillLevel} className="h-2" />
                          </div>
                          <span className="text-sm text-muted-foreground w-12">
                            {skillLevel}%
                          </span>
                          <Button 
                            type="button" 
                            onClick={addSkill}
                            disabled={!newSkill.trim()}
                            className="h-10"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {watch("skills")?.map((skill, index) => (
                        <motion.div
                          key={skill.name}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center gap-4"
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{skill.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {skill.level}%
                              </span>
                            </div>
                            <ProgressLabelCard value={skill.level} className="h-2" />
                          </div>
                          <button 
                            type="button"
                            onClick={() => removeSkill(index)}
                            className="text-muted-foreground hover:text-destructive transition-colors p-2"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  <CardFooter className="flex justify-end px-0 pt-6 pb-0">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          Saving...
                        </span>
                      ) : "Save Skills"}
                    </Button>
                  </CardFooter>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}