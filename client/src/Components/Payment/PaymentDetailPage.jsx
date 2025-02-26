/* eslint-disable no-extra-semi */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import axios from "axios";
import { Navigate, useParams } from "react-router-dom";
import PaymentDetail from "./PaymentDetail.jsx";
import Preloader from "../../Preloader.jsx";
import { useAuth } from "../../context/authContext.jsx";
const base_url = import.meta.env.VITE_API_BASE_URL;

const PaymentDetailPage = () => {
  const { validToken, team, isLoading } = useAuth();
  const { id } = useParams();
  const { txnid } = useParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPaymentDetails = async () => {
    try {
      const { data } = await axios.get(`${base_url}/api/v1/payment/single-payment/${id}`, {
        headers: {
          Authorization: validToken,
        },
      });

      if (data?.success) {
        setPayment(data?.data);
      };
    } catch (err) {
      setError("❌ Failed to load payment details.");
    } finally {
      setLoading(false);
    };
  };

  useEffect(() => {
    if (id && validToken) {
      fetchPaymentDetails(id);
    };
  }, [id, validToken]);

  if (isLoading) {
    return <Preloader />;
  };

  if (team?.role?.name?.toLowerCase() !== "admin") {
    return <Navigate to="/" />;
  };

  if (loading) {
    return <p className="text-center mt-5">Loading payment details...</p>;
  };

  if (error) {
    return <p className="text-center text-danger mt-5">{error}</p>;
  };

  if (!payment) {
    return <p className="text-center text-danger mt-5">No payment data found.</p>;
  };

  return <PaymentDetail payment={payment} txnid={txnid} />;
};

export default PaymentDetailPage;
