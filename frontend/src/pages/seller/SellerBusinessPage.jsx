import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
// import axios from "axios";
import "../../styles/seller/SellerBusinessPage.css";
import BusinessInfoCard from "../../components/seller/BusinessInfoCard"; // import

const SellerBusinessPage = () => {
  const { user } = useContext(AuthContext);
  console.log(user.id);

  return (
    <main className="restaurants-main">
      <BusinessInfoCard />
    </main>
  );
};

export default SellerBusinessPage;
