import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const TicketList = ({ tickets, refreshTickets }) => {
  if (tickets.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="text-gray-600">Aucun ticket trouvé.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Utilisateur
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Catégorie
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Assigné à
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tickets.map(ticket => (
            <tr key={ticket._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <Link to={`/user/${ticket.user._id}`} className="flex items-center">
                  {ticket.user.avatar ? (
                    <img src={ticket.user.avatar} alt={ticket.user.username} className="w-8 h-8 rounded-full mr-2" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white mr-2">
                      {ticket.user.username.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-900">{ticket.user.username}</span>
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                  {ticket.category}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {ticket.assignedTo ? (
                  <div className="flex items-center">
                    {ticket.assignedTo.avatar ? (
                      <img src={ticket.assignedTo.avatar} alt={ticket.assignedTo.username} className="w-6 h-6 rounded-full mr-2" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white mr-2">
                        {ticket.assignedTo.username.charAt(0)}
                      </div>
                    )}
                    <span className="text-sm text-gray-500">{ticket.assignedTo.username}</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">Non assigné</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  ticket.status === 'open'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {ticket.status === 'open' ? 'Ouvert' : 'Fermé'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(ticket.createdAt), 'dd MMM yyyy HH:mm', { locale: fr })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Link to={`/ticket/${ticket._id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                  Voir
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketList;