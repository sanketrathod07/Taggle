import {
  Route,
  Routes,
  Link,
  Outlet,
  useParams,
  useLocation,
} from "react-router-dom";

import { LikedPosts } from "@/_root/pages";
import { useUserContext } from "@/context/AuthContext";
import { useGetUserById, useGetUserFollowers, useGetUserFollowing } from "@/lib/react-query/queries";
import { GridPostList, Loader } from "@/components/shared";
import FollowButton from "@/components/FollowBtn";
import { useEffect, useState } from "react";

interface StatBlockProps {
  value: number | string;
  label: string;
}

const StatBlock = ({ value, label }: StatBlockProps) => {
  const displayValue =
    typeof value === "number"
      ? value >= 1e6
        ? (value / 1e6).toFixed(1) + "M"
        : value.toLocaleString()
      : value;

  return (
    <div className="flex-center gap-2">
      <p className="small-semibold lg:body-bold text-primary-500">{displayValue}</p>
      <p className="small-medium lg:base-medium text-light-2">{label}</p>
    </div>
  );
};

const Profile = () => {
  const { id } = useParams();
  const { user } = useUserContext();
  const { pathname } = useLocation();

  const { data: currentUser } = useGetUserById(id || "");
  const { data: followers } = useGetUserFollowers(id || "");
  const { data: following } = useGetUserFollowing(id || "");

  const [followerCount, setFollowerCount] = useState(1_200_000);

  useEffect(() => {
    if (currentUser?.$id === "676824d98eb244ad8d65") {
      const interval = setInterval(() => {
        setFollowerCount((prevCount) => prevCount + 100_000);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-inner_container">
        <div className="flex xl:flex-row flex-col max-xl:items-center flex-1 gap-7">
          <img
            src={
              currentUser.imageUrl || "/assets/icons/profile-placeholder.svg"
            }
            alt="profile"
            className="w-28 h-28 lg:h-36 lg:w-36 rounded-full"
          />
          <div className="flex flex-col flex-1 justify-between md:mt-2">
            <div className="flex flex-col w-full">
              <h1 className="text-center xl:text-left h3-bold md:h1-semibold w-full">
                {currentUser.name}
              </h1>
              <p className="small-regular md:body-medium text-light-3 text-center xl:text-left">
                @{currentUser.username}
              </p>
            </div>

            <div className="flex gap-8 mt-10 items-center justify-center xl:justify-start flex-wrap z-20">
              <StatBlock value={currentUser.posts.length} label="Posts" />
              <StatBlock
                value={
                  currentUser.$id === "676824d98eb244ad8d65"
                    ? followerCount
                    : followers?.length || 0
                }
                label="Followers"
              />
              <StatBlock value={following?.length || 0} label="Following" />
            </div>

            <p className="small-medium md:base-medium text-center xl:text-left mt-7 max-w-screen-sm">
              {currentUser.bio}
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <div className={`${user.id !== currentUser.$id && "hidden"}`}>
              <Link
                to={`/update-profile/${currentUser.$id}`}
                className={`h-12 bg-dark-4 px-5 text-light-1 flex-center gap-2 rounded-lg ${user.id !== currentUser.$id && "hidden"
                  }`}
              >
                <img
                  src={"/assets/icons/edit.svg"}
                  alt="edit"
                  width={20}
                  height={20}
                />
                <p className="flex whitespace-nowrap small-medium">
                  Edit Profile
                </p>
              </Link>
            </div>
            <div className={`${user.id === id && "hidden"}`}>
              <FollowButton follower={user.id} followed={currentUser.$id} />
            </div>
          </div>
        </div>
      </div>

      {currentUser.$id === user.id && (
        <div className="flex max-w-5xl w-full">
          <Link
            to={`/profile/${id}`}
            className={`profile-tab rounded-l-lg ${pathname === `/profile/${id}` && "!bg-dark-3"
              }`}
          >
            <img
              src={"/assets/icons/posts.svg"}
              alt="posts"
              width={20}
              height={20}
            />
            Posts
          </Link>
          <Link
            to={`/profile/${id}/liked-posts`}
            className={`profile-tab rounded-r-lg ${pathname === `/profile/${id}/liked-posts` && "!bg-dark-3"
              }`}
          >
            <img
              src={"/assets/icons/like.svg"}
              alt="like"
              width={20}
              height={20}
            />
            Liked Posts
          </Link>
        </div>
      )}

      <Routes>
        <Route
          index
          element={<GridPostList posts={currentUser.posts} showUser={false} />}
        />
        {currentUser.$id === user.id && (
          <Route path="/liked-posts" element={<LikedPosts />} />
        )}
      </Routes>
      <Outlet />
    </div>
  );
};

export default Profile;
