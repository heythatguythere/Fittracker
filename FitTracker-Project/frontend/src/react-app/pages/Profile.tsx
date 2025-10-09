import { useEffect, useState, FormEvent } from "react";
import { useAuth } from "../AuthContext";
import { useTheme } from "../ThemeContext";
import Layout from "../components/Layout";
import { User, Save, Calendar, Ruler, Target, Pencil, Trash2, Flame, Moon, Sun } from "lucide-react";
import axios from "axios";
import type { UserProfile } from "../../shared/types";

export default function Profile() {
  const { user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/profile", { withCredentials: true });
      setProfile(response.data);
      // Automatically enter edit mode if the profile is new/empty
      if (!response.data || !response.data.first_name) {
        setIsEditing(true);
      } else {
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      setProfile({} as UserProfile); // Set a blank profile on error
      setIsEditing(true);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Process form data, converting numbers and dates correctly
    const profileData = {
      ...data,
      height_cm: data.height_cm ? parseFloat(data.height_cm as string) : null,
      weight_goal_kg: data.weight_goal_kg ? parseFloat(data.weight_goal_kg as string) : null,
      body_fat_goal_percentage: data.body_fat_goal_percentage ? parseFloat(data.body_fat_goal_percentage as string) : null,
      date_of_birth: data.date_of_birth ? new Date(data.date_of_birth as string) : null,
      // Add the new nutritional goals
      calorie_goal: data.calorie_goal ? parseInt(data.calorie_goal as string, 10) : null,
      protein_goal: data.protein_goal ? parseInt(data.protein_goal as string, 10) : null,
      carbs_goal: data.carbs_goal ? parseInt(data.carbs_goal as string, 10) : null,
      fat_goal: data.fat_goal ? parseInt(data.fat_goal as string, 10) : null,
    };

    try {
      const response = await axios.post("/api/profile", profileData, { withCredentials: true });
      setProfile(response.data);
      setSaveMessage("Profile saved successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save profile:", error);
      setSaveMessage("Error: Could not save profile.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await axios.delete("/api/user", { withCredentials: true });
      window.location.href = "/"; // Redirect to home after deletion
    } catch (error) {
      console.error("Failed to delete account:", error);
      setDeleting(false);
      alert("Error: Could not delete account.");
    }
  };

  if (loading) {
    return <Layout><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div></Layout>;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Manage your personal information and fitness goals.</p>
          </div>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <Pencil className="h-4 w-4" /><span>Edit Profile</span>
            </button>
          )}
        </div>

        {saveMessage && <div className={`p-4 mb-4 rounded-md text-sm ${saveMessage.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{saveMessage}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <img src={user?.image || `https://ui-avatars.com/api/?name=${user?.displayName || 'U'}&background=E2E8F0&color=1A202C`} alt="Profile" className="h-20 w-20 rounded-full mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900">{user?.displayName || "User"}</h2>
              <p className="text-gray-600 text-sm">{user?.email}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Management</h3>
              
              {/* Dark Mode Toggle */}
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {isDarkMode ? <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" /> : <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                    </span>
                  </div>
                  <button
                    onClick={toggleDarkMode}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isDarkMode ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isDarkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
              
              <button onClick={() => setShowDeleteModal(true)} className="w-full bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50" disabled={deleting}>
                <Trash2 className="h-4 w-4" /><span>{deleting ? "Deleting..." : "Delete Account"}</span>
              </button>
            </div>
          </div>

          {/* Right Column (Form) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <form onSubmit={saveProfile}>
                {/* Personal Information Section */}
                <div className="flex items-center mb-6"><User className="h-5 w-5 text-gray-400 mr-2" /><h3 className="text-lg font-semibold text-gray-900">Personal Information</h3></div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium mb-1">First Name</label><input type="text" name="first_name" defaultValue={profile?.first_name || ""} disabled={!isEditing} className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-50" /></div>
                    <div><label className="block text-sm font-medium mb-1">Last Name</label><input type="text" name="last_name" defaultValue={profile?.last_name || ""} disabled={!isEditing} className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-50" /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium mb-1"><Calendar className="h-4 w-4 inline mr-1" />Date of Birth</label><input type="date" name="date_of_birth" defaultValue={profile?.date_of_birth?.toString().split('T')[0] || ""} disabled={!isEditing} className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-50" /></div>
                    <div><label className="block text-sm font-medium mb-1"><Ruler className="h-4 w-4 inline mr-1" />Height (cm)</label><input type="number" name="height_cm" defaultValue={profile?.height_cm || ""} disabled={!isEditing} className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-50" /></div>
                  </div>
                </div>

                {/* Fitness Goals Section */}
                <hr className="my-6 border-gray-200" />
                <div className="flex items-center mb-6"><Target className="h-5 w-5 text-gray-400 mr-2" /><h3 className="text-lg font-semibold text-gray-900">Fitness Goals</h3></div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium mb-1">Weight Goal (kg)</label><input type="number" name="weight_goal_kg" step="0.1" defaultValue={profile?.weight_goal_kg || ""} disabled={!isEditing} className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-50" /></div>
                    <div><label className="block text-sm font-medium mb-1">Body Fat Goal (%)</label><input type="number" name="body_fat_goal_percentage" step="0.1" defaultValue={profile?.body_fat_goal_percentage || ""} disabled={!isEditing} className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-50" /></div>
                  </div>
                  <div><label className="block text-sm font-medium mb-1">Primary Fitness Goal</label><textarea name="fitness_goals" rows={3} defaultValue={profile?.fitness_goals || ""} disabled={!isEditing} className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-50" placeholder="e.g., Build muscle, lose 10kg, run a 5k..." /></div>
                </div>

                {/* --- NEW: Nutritional Goals Section --- */}
                <hr className="my-6 border-gray-200" />
                <div className="flex items-center mb-6"><Flame className="h-5 w-5 text-gray-400 mr-2" /><h3 className="text-lg font-semibold text-gray-900">Nutritional Goals</h3></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div><label className="block text-sm font-medium mb-1">Calories</label><input type="number" name="calorie_goal" defaultValue={profile?.calorie_goal || ""} disabled={!isEditing} className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-50" placeholder="e.g., 2000" /></div>
                    <div><label className="block text-sm font-medium mb-1">Protein (g)</label><input type="number" name="protein_goal" defaultValue={profile?.protein_goal || ""} disabled={!isEditing} className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-50" placeholder="e.g., 150" /></div>
                    <div><label className="block text-sm font-medium mb-1">Carbs (g)</label><input type="number" name="carbs_goal" defaultValue={profile?.carbs_goal || ""} disabled={!isEditing} className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-50" placeholder="e.g., 250" /></div>
                    <div><label className="block text-sm font-medium mb-1">Fat (g)</label><input type="number" name="fat_goal" defaultValue={profile?.fat_goal || ""} disabled={!isEditing} className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-50" placeholder="e.g., 70" /></div>
                </div>

                {isEditing && (
                  <div className="mt-8">
                    <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                      <Save className="h-4 w-4" /><span>{saving ? "Saving..." : "Save Profile"}</span>
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
              <p className="text-gray-700 mb-6">Are you sure you want to delete your account? This action is permanent and cannot be undone.</p>
              <div className="flex justify-end space-x-4">
                <button onClick={() => setShowDeleteModal(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg">Cancel</button>
                <button onClick={handleDeleteAccount} disabled={deleting} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg disabled:opacity-50">{deleting ? "Deleting..." : "Delete Permanently"}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}