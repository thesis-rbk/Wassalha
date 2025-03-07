"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import styles from '../styles/Profile.module.css';
import navStyles from '../styles/Nav.module.css';
import Nav from "../components/Nav";
import Image from 'next/image';

interface UserProfile {
    id: number;
    name: string;
    email: string;
    phoneNumber?: string;
    role: string;
    profile: {
        firstName: string;
        lastName: string;
        image?: { url: string };
        country?: string;
        gender?: string;
        isBanned: boolean;
        verified: boolean;
    };
}

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
                    const response = await axios.get(`http://localhost:5000/api/users/${id}`);
                    const data = response.data;
                    setUserProfile(data);
                    setUpdatedProfile({
                        ...data,
                        profile: { ...data.profile }
                    });
                } catch (err) {
                    if (axios.isAxiosError(err)) {
                        setError(err.response?.data?.error || err.message);
                    } else {
                        setError("An unknown error occurred");
                    }
                    console.error("Error fetching user profile:", err);
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
        if (userProfile && userProfile.profile) {
            const isBanned = userProfile.profile.isBanned;
            try {
                const response = await axios.put(`http://localhost:5000/api/users/${userProfile.id}/${isBanned ? 'unban' : 'ban'}`, {
                    isBanned: !isBanned
                });

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
        if (!userProfile) return;

        try {
            // Prepare the data to be sent to the API
            const updateData: UserProfile = {
                id: userProfile.id,
                name: updatedProfile.name || userProfile.name,
                email: updatedProfile.email || userProfile.email,
                phoneNumber: updatedProfile.phoneNumber || userProfile.phoneNumber,
                role: updatedProfile.role || userProfile.role,
                profile: {
                    firstName: updatedProfile.profile?.firstName || userProfile.profile.firstName,
                    lastName: updatedProfile.profile?.lastName || userProfile.profile.lastName,
                    country: updatedProfile.profile?.country || userProfile.profile.country,
                    gender: updatedProfile.profile?.gender || userProfile.profile.gender,
                    isBanned: userProfile.profile.isBanned,
                    verified: userProfile.profile.verified,
                    ...(userProfile.profile.image && { image: userProfile.profile.image })
                }
            };

            console.log("Sending update with data:", updateData);

            const response = await axios.put(`http://localhost:5000/api/users/${userProfile.id}`, updateData);
            console.log("Response from server:", response.data);
            
            // If the API returns the updated user directly
            if (response.data && (response.data.id || response.data.user?.id)) {
                const updatedUser = response.data.user || response.data;
                
                // Update the userProfile state with the new data
                setUserProfile(updatedUser);
                
                // Also update the updatedProfile state
                setUpdatedProfile({
                    ...updatedUser,
                    profile: { ...updatedUser.profile }
                });
                
                console.log("Updated user profile:", updatedUser);
            } else {
                // If the API doesn't return the updated user, fetch it again
                console.log("Fetching updated profile after update");
                const refreshResponse = await axios.get(`http://localhost:5000/api/users/${userProfile.id}`);
                const refreshedUser = refreshResponse.data;
                
                setUserProfile(refreshedUser);
                setUpdatedProfile({
                    ...refreshedUser,
                    profile: { ...refreshedUser.profile }
                });
                
                console.log("Refreshed user profile:", refreshedUser);
            }
            
            setIsEditing(false);
            alert("User profile updated successfully!");
        } catch (err) {
            let errorMessage = "Failed to update user profile";
            if (axios.isAxiosError(err)) {
                errorMessage = err.response?.data?.error || err.message;
                console.error("API error response:", err.response?.data);
            }
            alert(errorMessage);
            console.error("Error updating profile:", err);
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
        <div className={navStyles.layout}>
            <Nav />
            <div className={navStyles.mainContent}>
                <div className={styles.container}>
                    <div className={styles.card}>
                        <div className={styles.leftsection}>
                            <div className={styles.imageWrapper}>
                                <img
                                    src={userProfile.profile?.image?.url || "/default-profile.png"}
                                    alt="Profile"
                                    className={styles.img}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "/default-profile.png";
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
                        </div>
                        <div className={styles.rightsection}>
                            {isEditing ? (
                                <form onSubmit={(e) => e.preventDefault()}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>First Name:</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={updatedProfile.profile?.firstName || ''}
                                            onChange={handleInputChange}
                                            className={styles.input}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Last Name:</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={updatedProfile.profile?.lastName || ''}
                                            onChange={handleInputChange}
                                            className={styles.input}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Email:</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={updatedProfile.email || ''}
                                            onChange={handleInputChange}
                                            className={styles.input}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Phone Number:</label>
                                        <input
                                            type="text"
                                            name="phoneNumber"
                                            value={updatedProfile.phoneNumber || ''}
                                            onChange={handleInputChange}
                                            className={styles.input}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Country:</label>
                                        <input
                                            type="text"
                                            name="country"
                                            value={updatedProfile.profile?.country || ''}
                                            onChange={handleInputChange}
                                            className={styles.input}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Gender:</label>
                                        <select
                                            name="gender"
                                            value={updatedProfile.profile?.gender || ''}
                                            onChange={handleInputChange}
                                            className={styles.input}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    </div>
                                    <div className={styles.actionButtons}>
                                        <button onClick={handleEditToggle} className={styles.buttoncancel}>
                                            Cancel
                                        </button>
                                        <button onClick={handleUpdateUser} className={styles.buttonsubmit}>
                                            Submit
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>First Name:</span>
                                        <span className={styles.infoValue}>
                                            {userProfile?.profile.firstName || 'N/A'}
                                        </span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Last Name:</span>
                                        <span className={styles.infoValue}>
                                            {userProfile?.profile.lastName || 'N/A'}
                                        </span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Email:</span>
                                        <span className={styles.infoValue}>
                                            {userProfile?.email || 'N/A'}
                                        </span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Phone Number:</span>
                                        <span className={styles.infoValue}>
                                            {userProfile?.phoneNumber || 'N/A'}
                                        </span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Country:</span>
                                        <span className={styles.infoValue}>
                                            {userProfile?.profile.country || 'N/A'}
                                        </span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Gender:</span>
                                        <span className={styles.infoValue}>
                                            {userProfile?.profile.gender || 'N/A'}
                                        </span>
                                    </div>
                                    <div className={styles.actionButtons}>
                                        <button onClick={handleEditToggle} className={styles.buttonedit}>
                                            Edit
                                        </button>
                                        <button 
                                            onClick={handleBanUnban}
                                            className={`${styles.buttonban} ${userProfile?.profile?.isBanned ? styles.unban : ''}`}
                                        >
                                            {userProfile?.profile?.isBanned ? "Unban" : "Ban"}
                                        </button>
                                    </div>
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
