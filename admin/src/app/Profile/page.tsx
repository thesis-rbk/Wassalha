"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from '../../styles/Profile.module.css';
import navStyles from '../../styles/Nav.module.css';
import Nav from "../../components/Nav";
import Image from 'next/image';
import { UserProfile } from "../../types/UserProfile";
import api from "../../lib/api";
import { User, UserRole } from '../../types/User';

// Create a type for partial profile that makes nested properties optional
type PartialUserProfile = Partial<Omit<UserProfile, 'profile'>> & {
    profile?: Partial<UserProfile['profile']>;
};

const Profile: React.FC = () => {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const [userProfile, setUserProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [mounted, setMounted] = useState<boolean>(false);
    const [updatedProfile, setUpdatedProfile] = useState<PartialUserProfile>({
        profile: {
            firstName: '',
            lastName: '',
            bio: '',
            review: '',
            country: '',
            gender: '',
            isBanned: false,
            isVerified: false
        }
    });
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);
    const [popupType, setPopupType] = useState<'success' | 'error'>('success');
    const [popupMessage, setPopupMessage] = useState<string>('');
    const [showPopup, setShowPopup] = useState<boolean>(false);

    // Handle mounting to prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        // Get current user's role from localStorage
        const userData = localStorage.getItem('userData');
        if (userData) {
            const parsedUserData = JSON.parse(userData);
            setCurrentUserRole(parsedUserData.role);
        }
    }, []);

    // Fetch user data
    useEffect(() => {
        if (mounted && id) {
            const fetchUserProfile = async () => {
                try {
                    const token = localStorage.getItem('adminToken');
                    if (!token) {
                        window.location.href = '/AdminLogin';
                        return;
                    }

                    const response = await api.get(`/api/users/${id}`, {
                        headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        }
                    );

                    if (response.data) {
                        setUserProfile(response.data);
                        // Initialize updatedProfile with the fetched data
                        setUpdatedProfile({
                            name: response.data.name || '',
                            email: response.data.email || '',
                           
                            role: response.data.role || '',
                            profile: {
                                firstName: response.data.profile?.firstName || '',
                                lastName: response.data.profile?.lastName || '',
                                phoneNumber: response.data.phoneNumber || '',
                                bio: response.data.profile?.bio || '',
                                review: response.data.profile?.review || '',
                                country: response.data.profile?.country || '',
                                gender: response.data.profile?.gender || '',
                                isBanned: response.data.profile?.isBanned || false,
                                isVerified: response.data.profile?.isVerified || false,
                                image: response.data.profile?.image || null
                            }
                        });
                    }
                } catch (err) {
                    console.error("Error fetching user profile:", err);
                    if (axios.isAxiosError(err)) {
                        if (err.response?.status === 401) {
                            window.location.href = '/AdminLogin';
                            return;
                        }
                        setError(err.response?.data?.error || 'Failed to load user profile');
                    } else {
                        setError('Failed to load user profile');
                    }
                } finally {
                    setLoading(false);
                }
            };

            fetchUserProfile();
        }
    }, [id, mounted]);

    // Don't render anything until client-side hydration is complete
    if (!mounted) {
        return null;
    }

    const handleBanUnban = async () => {
        if (!userProfile?.id) return;

        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                window.location.href = '/AdminLogin';
                return;
            }

            const isBanned = userProfile.profile?.isBanned;
            const response = await api.put(
                `/api/users/${userProfile.id}/${isBanned ? 'unban' : 'ban'}`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const data = response.data;
            // Update the local state with the new data
            setUserProfile(prev => prev ? {
                ...prev,
                profile: {
                    ...prev.profile,
                    isBanned: !prev.profile?.isBanned,
                    firstName: prev.profile?.firstName || '',
                    lastName: prev.profile?.lastName || '',
                    isVerified: prev.profile?.isVerified || false
                }
            } : null);
            alert(data.message || "User status updated successfully");
        } catch (err) {
            if (axios.isAxiosError(err)) {
                alert(err.response?.data?.error || "Failed to update user status");
            } else {
                alert("Failed to update ban status");
            }
            console.error(err);
        }
    };

    const handleEditToggle = () => {
        if (isEditing) {
            // Reset form when canceling edit
            setUpdatedProfile(userProfile ? {
                ...userProfile,
                profile: { ...userProfile.profile }
            } : {
                profile: {
                    firstName: '',
                    lastName: '',
                    isBanned: false,
                    isVerified: false
                }
            });
        }
        setIsEditing(!isEditing);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setUpdatedProfile((prev) => {
            if (["firstName", "lastName", "country", "gender"].includes(name)) {
                return {
                    ...prev,
                    profile: {
                        ...prev.profile,
                        [name]: value,
                    },
                };
            }
            return { ...prev, [name]: value };
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpdateUser = async () => {
        if (!userProfile?.id) {
            alert("No user selected for update");
            return;
        }

        console.log("Updating user with ID:", userProfile.id); // Debugging line

        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                window.location.href = '/AdminLogin';
                return;
            }

            // Create the update data object
            const updateData = {
                id: userProfile.id, // Ensure ID is included
                name: updatedProfile.name,
                email: updatedProfile.email,
                phoneNumber: updatedProfile.profile?.phoneNumber,
                role: updatedProfile.role,
                firstName: updatedProfile.profile?.firstName,
                lastName: updatedProfile.profile?.lastName,
                bio: updatedProfile.profile?.bio,
                country: updatedProfile.profile?.country,
                gender: updatedProfile.profile?.gender
            };

            // If there's a new image, create FormData
            if (selectedImage) {
                const formData = new FormData();
                // Add all update data to FormData
                Object.entries(updateData).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        formData.append(key, value.toString());
                    }
                });
                formData.append('image', selectedImage);

                const response = await api.put(
                    `/api/users/${userProfile.id}`,
                    formData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                handleUpdateSuccess(response);
            } else {
                // If no new image, send JSON data
                const response = await api.put(
                    `/api/users/${userProfile.id}`,
                    updateData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                handleUpdateSuccess(response);
            }
        } catch (err) {
            let errorMessage = "Failed to update user profile";
            if (axios.isAxiosError(err)) {
                errorMessage = err.response?.data?.error || err.message;
            }
            alert(errorMessage);
            console.error("Error updating profile:", err);
        }
    };

    // Separate function to handle successful update
    const handleUpdateSuccess = (response: any) => {
        if (response.data) {
            setUserProfile(response.data.data.user);
            setUpdatedProfile({
                name: response.data.data.user.name,
                email: response.data.data.user.email,
                
                role: response.data.data.user.role,
                profile: {
                    firstName: response.data.data.user.profile?.firstName || '',
                    lastName: response.data.data.user.profile?.lastName || '',
                    bio: response.data.data.user.profile?.bio || '',
                    country: response.data.data.user.profile?.country || '',
                    phoneNumber: response.data.data.user.profile?.phoneNumber || '',
                    gender: response.data.data.user.profile?.gender || '',
                    isBanned: response.data.data.user.profile?.isBanned || false,
                    isVerified: response.data.data.user.profile?.isVerified || false,
                    image: response.data.data.user.profile?.image || null
                }
            });
            setIsEditing(false);
            setSelectedImage(null);
            setPreviewUrl(null);
            alert("User profile updated successfully!");
        }
    };

    const handleDeleteAccount = async () => {
        if (!userProfile?.id) {
            alert("No user selected for deletion");
            return;
        }

        // Add confirmation dialog
        const isConfirmed = window.confirm(
            "Are you sure you want to delete this account? This action cannot be undone."
        );
        
        if (!isConfirmed) return;

        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                window.location.href = '/AdminLogin';
                return;
            }

            console.log("Attempting to delete user with ID:", userProfile.id);

            const response = await api.delete(
                `/api/admin/users/${userProfile.id}`, // Updated endpoint
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setPopupType('success');
                setPopupMessage("User account deleted successfully");
                setShowPopup(true);
                setTimeout(() => {
                    setShowPopup(false);
                    window.location.href = '/ListOfUsers';
                }, 2000);
            } else {
                throw new Error(response.data.error || "Failed to delete user account");
            }
        } catch (err) {
            console.error("Error deleting user account:", err);
            
            if (axios.isAxiosError(err)) {
                const errorMessage = err.response?.data?.error || 
                                   err.response?.data?.message || 
                                   "Failed to delete user account";
                setPopupType('error');
                setPopupMessage(`Error: ${errorMessage}`);
                setShowPopup(true);
                setTimeout(() => setShowPopup(false), 3000);
            } else {
                setPopupType('error');
                setPopupMessage("An unexpected error occurred while deleting the account");
                setShowPopup(true);
                setTimeout(() => setShowPopup(false), 3000);
            }
        }
    };

    // Update the permission checks
    const canEditProfile = () => {
        if (!userProfile?.role || !currentUserRole) return false;

        // Admin can edit their own profile
        if (userProfile.id === JSON.parse(localStorage.getItem('userData') || '{}').id) {
            return true;
        }

        // Super admin can't edit other super admins
        if (userProfile.role === 'SUPER_ADMIN') {
            return false;
        }
        
        // Super admin can't edit admins (only delete them)
        if (userProfile.role === 'ADMIN' && currentUserRole === 'SUPER_ADMIN') {
            return false;
        }

        // Regular admins can't edit other admins or super admins
        if ((userProfile.role === ('ADMIN' as UserRole) || userProfile.role === ('SUPER_ADMIN' as UserRole)) && 
            currentUserRole === ('ADMIN' as UserRole)) {
            return false;
        }

        return currentUserRole === 'ADMIN' || currentUserRole === 'SUPER_ADMIN';
    };

    const canDeleteProfile = () => {
        // Admin can delete their own profile
        if (userProfile?.id === JSON.parse(localStorage.getItem('userData') || '{}').id) {
            return true;
        }

        // Nobody can delete super admins
        if (userProfile?.role === 'SUPER_ADMIN') {
            return false;
        }

        // Only super admin can delete admins
        if (userProfile?.role === 'ADMIN') {
            return currentUserRole === 'SUPER_ADMIN';
        }

        // Both admin and super admin can delete regular users
        return currentUserRole === 'ADMIN' || currentUserRole === 'SUPER_ADMIN';
    };

    // Check if current user can ban the profile
    const canBanProfile = () => {
        // Can't ban admin or super admin profiles
        if (userProfile?.role === 'ADMIN' || userProfile?.role === 'SUPER_ADMIN') {
            return false;
        }

        // Both admin and super admin can ban regular users
        return currentUserRole === 'ADMIN' || currentUserRole === 'SUPER_ADMIN';
    };

    // Update the edit form section to prevent role editing for certain cases
    const canEditRole = () => {
        // Only super admin can change roles, and only for regular users
        return currentUserRole === 'SUPER_ADMIN' && userProfile?.role === 'USER';
    };

    // In your page.tsx file, add a condition to check if the profile is for an admin
    const isAdminProfile = userProfile?.role === "ADMIN";

    if (loading) {
        return (
            <div className={navStyles.layout}>
                <Nav />
                <div className={navStyles.mainContent}>
                    <div className={styles.loading}>Loading...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={navStyles.layout}>
                <Nav />
                <div className={navStyles.mainContent}>
                    <div className={styles.error}>Error: {error}</div>
                </div>
            </div>
        );
    }

    if (!userProfile) {
        return (
            <div className={navStyles.layout}>
                <Nav />
                <div className={navStyles.mainContent}>
                    <div className={styles.error}>User not found</div>
                </div>
            </div>
        );
    }

    return (
        <div className={navStyles.layout} style={{ overflowY: 'auto', height: '100vh' }}>
            <Nav />
            <div className={navStyles.mainContent} style={{ overflowY: 'auto' }}>
                <div className={styles.container}>
                    <div className={styles.card}>
                        <div className={styles.leftsection}>
                            <div className={styles.imageWrapper}>
                                {isEditing ? (
                                    <>
                                        {previewUrl || userProfile?.profile?.image?.url ? (
                                            <img
                                                src={previewUrl || userProfile?.profile?.image?.url}
                                                alt={`${userProfile?.profile?.firstName || 'User'}'s profile`}
                                                className={styles.profileImage}
                                            />
                                        ) : (
                                            <div className={styles.profilePlaceholder}>
                                                {userProfile?.profile?.firstName?.[0] || 
                                                 userProfile?.name?.[0] || 
                                                 userProfile?.email?.[0]?.toUpperCase() || 
                                                 '?'}
                                            </div>
                                        )}
                                        <div className={styles.imageUploadContainer}>
                                            <label htmlFor="imageUpload" className={styles.imageUploadLabel}>
                                                Change Profile Picture
                                            </label>
                                            <input
                                                id="imageUpload"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className={styles.imageUploadInput}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {userProfile?.profile?.image?.url ? (
                                            <img
                                                src={userProfile.profile.image.url}
                                                alt={`${userProfile?.name || 'User'}'s profile`}
                                                className={styles.profileImage}
                                            />
                                        ) : (
                                            <div className={styles.profilePlaceholder}>
                                                {userProfile?.profile?.firstName?.[0] || 
                                                 userProfile?.name?.[0] || 
                                                 userProfile?.email?.[0]?.toUpperCase() || 
                                                 '?'}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            <div className={styles.label}>ID: {userProfile?.id}</div>
                            
                            {isEditing ? (
                                <>
                                    <div className={styles.label}>Name:</div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={updatedProfile.name || userProfile?.name || ""}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                    />
                                    <div className={styles.label}>Role:</div>
                                    <select
                                        name="role"
                                        value={updatedProfile.role || userProfile?.role || ""}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                        disabled={!canEditRole()}
                                    >
                                        <option value="USER">User</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </>
                            ) : (
                                <>
                                    <div className={styles.label}>Name: {userProfile?.name}</div>
                                    <div className={styles.label}>Role: {userProfile?.role}</div>
                                </>
                            )}

                            {userProfile?.profile && userProfile.profile.isBanned ? (
                                <div className={styles.banned}>User is banned</div>
                            ) : userProfile?.profile && userProfile.profile.isVerified ? (
                                <div className={styles.verified}>Verified</div>
                            ) : (
                                <div className={styles.unverified}>Not Verified</div>
                            )}

                            <div className={styles.bioContainer}>
                                <div className={styles.label}>Bio:</div>
                                {isEditing ? (
                                    <textarea
                                        name="bio"
                                        value={updatedProfile.profile?.bio || ''}
                                        onChange={(e) => setUpdatedProfile(prev => ({
                                            ...prev,
                                            profile: {
                                                ...prev.profile,
                                                bio: e.target.value
                                            }
                                        }))}
                                        className={styles.textarea}
                                        placeholder="Enter bio..."
                                    />
                                ) : (
                                    <div className={styles.bioContent}>
                                        {userProfile?.profile?.bio || 'No bio available'}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={styles.rightsection}>
                            {isEditing ? (
                                <>
                                    <form onSubmit={(e) => e.preventDefault()}>
                                        <div className={styles.formContent}>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>First Name:</label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={updatedProfile?.profile?.firstName || ''}
                                                    onChange={handleInputChange}
                                                    className={styles.input}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Last Name:</label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={updatedProfile?.profile?.lastName || ''}
                                                    onChange={handleInputChange}
                                                    className={styles.input}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Email:</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={updatedProfile?.email || ''}
                                                    onChange={handleInputChange}
                                                    className={styles.input}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Phone Number:</label>
                                                <input
                                                    type="text"
                                                    name="phoneNumber"
                                                    value={updatedProfile?.profile?.phoneNumber || ''}
                                                    onChange={handleInputChange}
                                                    className={styles.input}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Country:</label>
                                                <input
                                                    type="text"
                                                    name="country"
                                                    value={updatedProfile?.profile?.country || ''}
                                                    onChange={handleInputChange}
                                                    className={styles.input}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Gender:</label>
                                                <select
                                                    name="gender"
                                                    value={updatedProfile?.profile?.gender || ''}
                                                    onChange={handleInputChange}
                                                    className={styles.input}
                                                >
                                                    <option value="">Select Gender</option>
                                                    <option value="MALE">Male</option>
                                                    <option value="FEMALE">Female</option>
                                                </select>
                                            </div>
                                        </div>
                                    </form>
                                    {/* Fixed position button container */}
                                    <div className={styles.buttonContainer}>
                                        <div className={styles.buttonRow}>
                                            <button
                                                type="button"
                                                onClick={handleUpdateUser}
                                                className={`${styles.button} ${styles.buttonsubmit}`}
                                            >
                                                Save Changes
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleEditToggle}
                                                className={`${styles.button} ${styles.buttoncancel}`}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleDeleteAccount}
                                                className={`${styles.button} ${styles.buttonDelete}`}
                                            >
                                                Delete Account
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className={styles.infoRow}>
                                        <div className={styles.label}>First Name:</div>
                                        <div className={styles.value}>{userProfile?.profile?.firstName || 'N/A'}</div>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <div className={styles.label}>Last Name:</div>
                                        <div className={styles.value}>{userProfile?.profile?.lastName || 'N/A'}</div>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <div className={styles.label}>Email:</div>
                                        <div className={styles.value}>{userProfile?.email}</div>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <div className={styles.label}>Phone Number:</div>
                                        <div className={styles.value}>{userProfile?.profile?.phoneNumber || 'N/A'}</div>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <div className={styles.label}>Country:</div>
                                        <div className={styles.value}>{userProfile?.profile?.country || 'N/A'}</div>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <div className={styles.label}>Gender:</div>
                                        <div className={styles.value}>{userProfile?.profile?.gender || 'N/A'}</div>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <div className={styles.label}>Review:</div>
                                        <div className={styles.value}>
                                            {userProfile?.profile?.review || 'No review available'}
                                        </div>
                                    </div>
                                    <div className={styles.actionButtons}>
                                        <div className={styles.buttonRow}>
                                            {canEditProfile() && (
                                                <button
                                                    onClick={handleEditToggle}
                                                    className={`${styles.buttonedit} ${styles.fullWidth}`}
                                                >
                                                    Edit Profile
                                                </button>
                                            )}
                                            
                                            {canBanProfile() && (
                                                <button
                                                    onClick={handleBanUnban}
                                                    className={`${styles.buttonban} ${userProfile?.profile?.isBanned ? styles.unban : ''}`}
                                                >
                                                    {userProfile?.profile?.isBanned ? "Unban User" : "Ban User"}
                                                </button>
                                            )}
                                            
                                            {canDeleteProfile() && (
                                                <button
                                                    onClick={handleDeleteAccount}
                                                    className={styles.buttonDelete}
                                                >
                                                    Delete Account
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {showPopup && (
                <div className={styles.popup}>
                    {popupType === 'success' ? (
                        <div className={styles.successPopup}>{popupMessage}</div>
                    ) : (
                        <div className={styles.errorPopup}>{popupMessage}</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Profile;
