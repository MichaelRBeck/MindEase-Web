import "@testing-library/jest-dom";
import "@testing-library/jest-dom";
import "whatwg-fetch";


jest.mock("@/app/lib/firebase/client", () => ({
    firebaseClientApp: {},
    firebaseAuth: {},
    firestore: {},
}));
