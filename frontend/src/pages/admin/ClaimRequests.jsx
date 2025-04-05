import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/config';
import { getClaimRequests } from '../../services/itemService';
import Navbar from '../../components/Navbar';

const ClaimRequests = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      console.log('Fetching claims...');
      const response = await getClaimRequests();
      console.log('Claims response:', response);
      
      if (response.success && Array.isArray(response.claims)) {
        setClaims(response.claims);
        console.log('Claims loaded:', response.claims.length);
      } else {
        console.error('Invalid claims data:', response);
        setError('Invalid claims data received');
        setClaims([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching claims:', err);
      setError('Failed to fetch claim requests');
      toast.error('Failed to fetch claim requests');
      setClaims([]);
      setLoading(false);
    }
  };

  const handleApproveClaim = async (claimId) => {
    try {
      console.log('Approving claim:', claimId);
      const response = await api.post(`/admin/claims/${claimId}/approve`);
      console.log('Approve response:', response.data);
      toast.success('Claim approved successfully');
      fetchClaims();
    } catch (err) {
      console.error('Error approving claim:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      toast.error(err.response?.data?.message || 'Failed to approve claim');
    }
  };

  const handleRejectClaim = async (claimId) => {
    try {
      console.log('Rejecting claim:', claimId);
      await api.post(`/admin/claims/${claimId}/reject`);
      toast.success('Claim rejected successfully');
      fetchClaims();
    } catch (err) {
      console.error('Error rejecting claim:', err);
      toast.error(err.response?.data?.message || 'Failed to reject claim');
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="text-center p-8">Loading...</div>
    </>
  );
  
  if (error) return (
    <>
      <Navbar />
      <div className="text-center p-8 text-red-600">{error}</div>
    </>
  );

  // Separate pending and processed claims
  const pendingClaims = claims.filter(claim => claim.status === 'pending');
  const processedClaims = claims.filter(claim => claim.status === 'claimed' || claim.status === 'rejected');

  return (
    <>
      <Navbar />
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Claim Requests</h2>
        
        {/* Pending Claims Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Pending Claims</h3>
          {pendingClaims.length === 0 ? (
            <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg">
              No pending claim requests
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-6 py-3 border-b text-left">Item Details</th>
                    <th className="px-6 py-3 border-b text-left">Claimant Details</th>
                    <th className="px-6 py-3 border-b text-left">Claim Date</th>
                    <th className="px-6 py-3 border-b text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingClaims.map((claim) => (
                    <tr key={claim._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 border-b">
                        <div>
                          <p className="font-semibold">{claim.title || 'N/A'}</p>
                          <p className="text-sm text-gray-600">Category: {claim.category || 'N/A'}</p>
                          <p className="text-sm text-gray-600">Location: {claim.location || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 border-b">
                        <div>
                          <p className="font-semibold">{claim.claimedBy?.firstName} {claim.claimedBy?.lastName}</p>
                          <p className="text-sm text-gray-600">Email: {claim.claimedBy?.email || 'N/A'}</p>
                          <p className="text-sm text-gray-600">Phone: {claim.claimedBy?.phoneNumber || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 border-b">
                        <span className="text-sm text-gray-600">
                          {claim.claimedBy?.claimedAt ? new Date(claim.claimedBy.claimedAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-b">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveClaim(claim._id)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectClaim(claim._id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Processed Claims Section */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Processed Claims</h3>
          {processedClaims.length === 0 ? (
            <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg">
              No processed claims
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-6 py-3 border-b text-left">Item Details</th>
                    <th className="px-6 py-3 border-b text-left">Claimant Details</th>
                    <th className="px-6 py-3 border-b text-left">Status</th>
                    <th className="px-6 py-3 border-b text-left">Claim Date</th>
                  </tr>
                </thead>
                <tbody>
                  {processedClaims.map((claim) => (
                    <tr key={claim._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 border-b">
                        <div>
                          <p className="font-semibold">{claim.title || 'N/A'}</p>
                          <p className="text-sm text-gray-600">Category: {claim.category || 'N/A'}</p>
                          <p className="text-sm text-gray-600">Location: {claim.location || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 border-b">
                        <div>
                          <p className="font-semibold">{claim.claimedBy?.firstName} {claim.claimedBy?.lastName}</p>
                          <p className="text-sm text-gray-600">Email: {claim.claimedBy?.email || 'N/A'}</p>
                          <p className="text-sm text-gray-600">Phone: {claim.claimedBy?.phoneNumber || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 border-b">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          claim.status === 'claimed' ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {claim.status === 'claimed' ? 'Approved' : 'Rejected'}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-b">
                        <span className="text-sm text-gray-600">
                          {claim.claimedBy?.claimedAt ? new Date(claim.claimedBy.claimedAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ClaimRequests; 