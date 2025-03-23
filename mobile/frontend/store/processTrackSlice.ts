import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Create the processTrack slice
const processTrackSlice = createSlice({
  name: "processTrack",
  initialState: {
    loading: false,
    error: "" as string | null,
    offerStatus: "" as string | null,
  },
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // New reducer for handling offer acceptance
    setOfferStatus: (state, action: PayloadAction<string | null>) => {
      state.offerStatus = action.payload;
    },

    // New reducer for handling real-time offer acceptance
    acceptOffer: (
      state,
      action: PayloadAction<{ orderId: number; travelerId: number }>
    ) => {
      const { orderId, travelerId } = action.payload;
      // Update the state to reflect the accepted offer
      state.offerStatus = "ACCEPTED";
      // You can add more logic here to update the chat or messages if needed
    },
  },
});

// Export actions
export const { setLoading, setError, setOfferStatus, acceptOffer } =
  processTrackSlice.actions;

// Export reducer
export default processTrackSlice.reducer;
