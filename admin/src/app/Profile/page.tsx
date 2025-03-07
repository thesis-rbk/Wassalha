"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from '../styles/Profile.module.css';

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

const Profile: React.FC = () => {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [updatedProfile, setUpdatedProfile] = useState<Partial<UserProfile>>({});

    useEffect(() => {
        if (id) {
            const fetchUserProfile = async () => {
                try {
                    const response = await fetch(`http://localhost:5000/api/users/${id}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch user profile');
                    }
                    const data = await response.json();
                    setUserProfile(data);
                    setUpdatedProfile(data);
                } catch (err: unknown) {
                    if (err instanceof Error) {
                        setError(err.message);
                    } else {
                        setError("An unknown error occurred");
                    }
                } finally {
                    setLoading(false);
                }
            };

            fetchUserProfile();
        }
    }, [id]);

    const handleBanUnban = async () => {
        if (userProfile && userProfile.profile) {
            const isBanned = userProfile.profile.isBanned;
            const response = await fetch(`http://localhost:5000/api/users/${userProfile.id}/${isBanned ? 'unban' : 'ban'}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ banned: !isBanned }),
            });

            const data = await response.json();
            if (response.ok) {
                setUserProfile(data.profile);
                alert(data.message);
            } else {
                alert(data.error);
            }
        }
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setUpdatedProfile((prev ) => {
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
        if (userProfile) {
            const response = await fetch(`http://localhost:5000/api/users/${userProfile.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: updatedProfile.name || userProfile.name,
                    email: updatedProfile.email || userProfile.email,
                    role: updatedProfile.role || userProfile.role,
                    phoneNumber: updatedProfile.phoneNumber || userProfile.phoneNumber,
                    profile: {
                        firstName: updatedProfile.profile?.firstName || userProfile.profile.firstName,
                        lastName: updatedProfile.profile?.lastName || userProfile.profile.lastName,
                        country: updatedProfile.profile?.country || userProfile.profile.country,
                        gender: updatedProfile.profile?.gender || userProfile.profile.gender,
                    },
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setUserProfile(data.user);
                setIsEditing(false);
                alert("User profile updated successfully!");
            } else {
                alert(data.error || "Failed to update profile");
            }
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className={styles.card}>
            <div className={styles.leftsection}>
                <img src={userProfile?.profile?.image?.url || "/default-profile.png"} alt="User" className={styles.img} />
                <div className={styles.label}>ID: {userProfile?.id}</div>
                <div className={styles.label}>Name: {userProfile?.name}</div>
                <div className={styles.label}>Role: {userProfile?.role}</div>
                {userProfile?.profile && userProfile.profile.isBanned ? (
                    <div className={styles.banned}>User is banned</div>
                ) : userProfile?.profile && userProfile.profile.verified ? (
                    <div className={styles.verified}>Verified</div>
                ) : (
                    <div className={styles.unverified}>Not Verified</div>
                )}
                <button onClick={handleEditToggle} className={styles.button_edit}>
                    {isEditing ? "Cancel" : "Edit"}
                </button>
            </div>
            <div className={styles.rightsection}>
                {isEditing ? (
                    <>
                        <div className={styles.label}>First Name:</div>
                        <input
                            type="text"
                            name="firstName"
                            value={updatedProfile.profile?.firstName || ""}
                            onChange={handleInputChange}
                        />
                        <div className={styles.label}>Last Name:</div>
                        <input
                            type="text"
                            name="lastName"
                            value={updatedProfile.profile?.lastName || ""}
                            onChange={handleInputChange}
                        />
                        <div className={styles.label}>Email:</div>
                        <input
                            type="email"
                            name="email"
                            value={updatedProfile.email || ""}
                            onChange={handleInputChange}
                        />
                        <div className={styles.label}>Phone Number:</div>
                        <input
                            type="text"
                            name="phoneNumber"
                            value={updatedProfile.phoneNumber || ""}
                            onChange={handleInputChange}
                        />
                        <div className={styles.label}>Country:</div>
                        <input
                            type="text"
                            name="country"
                            value={updatedProfile.profile?.country || ""}
                            onChange={handleInputChange}
                        />
                        <div className={styles.label}>Gender:</div>
                        <input
                            type="text"
                            name="gender"
                            value={updatedProfile.profile?.gender || ""}
                            onChange={handleInputChange}
                        />
                        <button onClick={handleUpdateUser} className={styles.button_submit}>
                            Submit
                        </button>
                    </>
                ) : (
                    <>
                        <div className={styles.label}>First Name:</div>
                        <div className={styles.value}>{userProfile?.profile?.firstName || "N/A"}</div>
                        <div className={styles.label}>Last Name:</div>
                        <div className={styles.value}>{userProfile?.profile?.lastName || "N/A"}</div>
                        <div className={styles.label}>Email:</div>
                        <div className={styles.value}>{userProfile?.email}</div>
                        <div className={styles.label}>Phone Number:</div>
                        <div className={styles.value}>{userProfile?.phoneNumber || "N/A"}</div>
                        <div className={styles.label}>Country:</div>
                        <div className={styles.value}>{userProfile?.profile?.country || "N/A"}</div>
                        <div className={styles.label}>Gender:</div>
                        <div className={styles.value}>{userProfile?.profile?.gender || "N/A"}</div>
                    </>
                )}
                <button className={styles.button_ban} onClick={handleBanUnban} style={{ backgroundColor: userProfile?.profile?.isBanned ? 'green' : 'red' }}>
                    {userProfile?.profile?.isBanned ? "Unban" : "Ban"}
                </button>
            </div>
        </div>
    );
};

export default Profile;
