import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";

const WebsiteLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
};

export default WebsiteLayout;
