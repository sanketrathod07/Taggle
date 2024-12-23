import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { followUser } from "@/lib/appwrite/api";

interface FollowButtonProps {
    follower: string; // Current user ID
    followed: string; // Profile user ID
}

const FollowButton: React.FC<FollowButtonProps> = ({ follower, followed }) => {
    const queryClient = useQueryClient();

    // Mutation to follow a user
    const { mutate: handleFollow, isLoading } = useMutation({
        mutationFn: () => followUser(follower, followed),
        onSuccess: () => {
            // Invalidate queries to refresh followers and following lists
            queryClient.invalidateQueries(["GET_USER_FOLLOWERS", followed]);
            queryClient.invalidateQueries(["GET_USER_FOLLOWING", follower]);
        },
        onError: (error) => {
            console.error("Failed to follow user:", error);
        },
    });

    return (
        <button
            onClick={() => handleFollow()}
            disabled={isLoading}
            className="shad-button_primary px-8"
        >
            {isLoading ? "Following..." : "Follow"}
        </button>
    );
};

export default FollowButton;
