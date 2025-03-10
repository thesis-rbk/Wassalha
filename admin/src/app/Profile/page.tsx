"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import styles from '../styles/Profile.module.css';
import navStyles from '../styles/Nav.module.css';
import Nav from "../components/Nav";
import Image from 'next/image';
import { UserProfile } from "../types/UserProfile";
import { User } from "../types/User";

// Create a type for partial profile that makes nested properties optional
type PartialUserProfile = Partial<Omit<UserProfile, 'profile'>> & {
    profile?: Partial<UserProfile['profile']>;
};

const Profile: React.FC = () => {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
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
            verified: false
        }
    });

    // Handle mounting to prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Fetch user data
    useEffect(() => {
        if (id && mounted) {
            const fetchUserProfile = async () => {
                try {
                    setLoading(true);
                    const token = localStorage.getItem('adminToken');
                    
                    if (!token) {
                        window.location.href = '/AdminLogin';
                        return;
                    }

                    const response = await axios.get(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    
                    const userData = response.data;
                    console.log('Full user data:', userData);
                    
                    if (userData.profile && !userData.profile.image) {
                        console.warn('Profile found but no image data:', userData.profile);
                    }
                    
                    setUserProfile(userData);
                    setUpdatedProfile({
                        name: userData.name,
                        email: userData.email,
                        phoneNumber: userData.phoneNumber,
                        role: userData.role,
                        profile: {
                            firstName: userData.profile?.firstName || '',
                            lastName: userData.profile?.lastName || '',
                            bio: userData.profile?.bio || '',
                            review: userData.profile?.review || '',
                            country: userData.profile?.country || '',
                            gender: userData.profile?.gender || '',
                            isBanned: userData.profile?.isBanned || false,
                            verified: userData.profile?.verified || false,
                            image: userData.profile?.image || null
                        }
                    });
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                    if (axios.isAxiosError(error) && error.response?.status === 401) {
                        // Token expired or invalid
                        localStorage.removeItem('adminToken');
                        localStorage.removeItem('userData');
                        window.location.href = '/AdminLogin';
                        return;
                    }
                    setError('Failed to load user profile');
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
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userProfile.id}/${isBanned ? 'unban' : 'ban'}`,
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
                    isBanned: !isBanned
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
                    verified: false
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

    const handleUpdateUser = async () => {
        if (!userProfile?.id) return;

        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                window.location.href = '/AdminLogin';
                return;
            }

            const updateData = {
                id: userProfile.id, // Ensure ID is included
                name: updatedProfile?.name || userProfile.name,
                email: updatedProfile?.email || userProfile.email,
                phoneNumber: updatedProfile?.phoneNumber || userProfile.phoneNumber,
                role: updatedProfile?.role || userProfile.role,
                profile: {
                    firstName: updatedProfile?.profile?.firstName || userProfile.profile?.firstName || '',
                    lastName: updatedProfile?.profile?.lastName || userProfile.profile?.lastName || '',
                    bio: updatedProfile?.profile?.bio || userProfile.profile?.bio || '',
                    review: updatedProfile?.profile?.review || userProfile.profile?.review || '',
                    country: updatedProfile?.profile?.country || userProfile.profile?.country || '',
                    gender: updatedProfile?.profile?.gender || userProfile.profile?.gender || '',
                    isBanned: userProfile.profile?.isBanned || false,
                    verified: userProfile.profile?.verified || false,
                    image: updatedProfile?.profile?.image || userProfile.profile?.image || null
                }
            };

            console.log('Sending update with data:', updateData);

            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userProfile.id}`,
                updateData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (response.data) {
                setUserProfile(response.data);
                setUpdatedProfile({
                    name: response.data.name,
                    email: response.data.email,
                    phoneNumber: response.data.phoneNumber,
                    role: response.data.role,
                    profile: {
                        firstName: response.data.profile?.firstName || '',
                        lastName: response.data.profile?.lastName || '',
                        bio: response.data.profile?.bio || '',
                        review: response.data.profile?.review || '',
                        country: response.data.profile?.country || '',
                        gender: response.data.profile?.gender || '',
                        isBanned: response.data.profile?.isBanned || false,
                        verified: response.data.profile?.verified || false,
                        image: response.data.profile?.image || null
                    }
                });
                setIsEditing(false);
                alert("User profile updated successfully!");
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

    const handleDeleteAccount = async () => {
        if (!userProfile?.id) return;

        // Add confirmation dialog
        const isConfirmed = window.confirm("Are you sure you want to delete this account? This action cannot be undone.");
        
        if (!isConfirmed) return;

        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                window.location.href = '/AdminLogin';
                return;
            }

            const response = await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userProfile.id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            const data = response.data;
            console.log('Deleted user profile:', data); // Debug log
            setUserProfile(null);
            setUpdatedProfile({
                profile: {
                    firstName: '',
                    lastName: '',
                    isBanned: false,
                    verified: false
                }
            });
            alert(data.message || "User account deleted successfully");
            // Optionally redirect to another page after successful deletion
            window.location.href = 'ListOfUsers'; // Adjust the path as needed
        } catch (err) {
            if (axios.isAxiosError(err)) {
                alert(err.response?.data?.error || "Failed to delete user account");
            } else {
                alert("Failed to delete user account");
            }
            console.error("Error deleting user account:", err);
        }
    };

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
                                <img
                                    src={userProfile?.profile?.image?.url }
                                    alt={`${userProfile?.name}'s profile`}
                                    className={styles.img}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        // target.src = "/default-profile.png";
                                    }}
                                />
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
                            ) : userProfile?.profile && userProfile.profile.verified ? (
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
                                                value={updatedProfile?.phoneNumber || ''}
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
                                        </div>
                                        <button
                                            onClick={handleDeleteAccount}
                                            className={`${styles.button} ${styles.buttonDelete}`}
                                        >
                                            Delete Account
                                        </button>
                                    </div>
                                </form>
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
                                        <div className={styles.value}>{userProfile?.phoneNumber || 'N/A'}</div>
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
                                    <div className={styles.buttonRow}>
                                        <button
                                            onClick={handleEditToggle}
                                            className={`${styles.button} ${styles.buttonedit} ${userProfile?.role === 'ADMIN' ? styles.fullWidth : ''}`}
                                        >
                                            Edit Profile
                                        </button>
                                        {userProfile?.role !== 'ADMIN' && (
                                            <button
                                                onClick={handleBanUnban}
                                                className={`${styles.button} ${styles.buttonban}`}
                                            >
                                                {userProfile?.profile?.isBanned ? 'Unban User' : 'Ban User'}
                                            </button>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleDeleteAccount}
                                        className={`${styles.button} ${styles.buttonDelete}`}
                                    >
                                        Delete Account
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
