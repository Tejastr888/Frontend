import { gql } from "@apollo/client";

/**
 * Query to get current user's profile
 * This will be used to check if profile exists and display it
 */
export const GET_MY_PROFILE = gql`
  query GetMyProfile {
    myProfile {
      id
      userId
      bio
      avatarUrl
      dateOfBirth
      gender
      city
      state
      country
      homeLat
      homeLng
      skillLevel
      preferredTimeSlots
      isProfessional
      yearsOfExperience
      achievements
      profileVisibility
      showStats
      createdAt
      updatedAt

      # Nested data - only fetched if asked
      favoriteSports {
        id
        sportId
        addedAt
      }

      socialLinks {
        id
        platform
        username
        profileUrl
        isVerified
      }

      stats {
        totalBookings
        completedBookings
        cancelledBookings
        totalHoursPlayed
        totalSpent
        averageBookingPrice
        currentStreakDays
        longestStreakDays
      }

      currentLocation {
        lat
        lng
        recordedAt
      }
    }
  }
`;

/**
 * Mutation to create a new profile
 */
export const CREATE_PROFILE = gql`
  mutation CreateProfile($input: CreateProfileInput!) {
    createProfile(input: $input) {
      id
      userId
      bio
      avatarUrl
      city
      state
      country
      skillLevel
      createdAt
    }
  }
`;

/**
 * Mutation to update existing profile
 */
export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      userId
      bio
      avatarUrl
      city
      state
      country
      skillLevel
      isProfessional
      yearsOfExperience
      achievements
      profileVisibility
      showStats
      updatedAt
    }
  }
`;

/**
 * Mutation to add favorite sport
 */
export const ADD_FAVORITE_SPORT = gql`
  mutation AddFavoriteSport($input: AddFavoriteSportInput!) {
    addFavoriteSport(input: $input) {
      id
      sportId
      addedAt
    }
  }
`;

/**
 * Mutation to remove favorite sport
 */
export const REMOVE_FAVORITE_SPORT = gql`
  mutation RemoveFavoriteSport($sportId: ID!) {
    removeFavoriteSport(sportId: $sportId)
  }
`;

/**
 * Query to get user's favorite sports
 */
export const GET_MY_FAVORITE_SPORTS = gql`
  query GetMyFavoriteSports {
    myFavoriteSports {
      id
      sportId
      addedAt
    }
  }
`;

/**
 * Query to get user's stats
 */
export const GET_MY_STATS = gql`
  query GetMyStats {
    myStats {
      totalBookings
      completedBookings
      cancelledBookings
      totalHoursPlayed
      totalSpent
      averageBookingPrice
      currentStreakDays
      longestStreakDays
    }
  }
`;
