import { gql } from '@apollo/client';

// Fragment reutilisable pour les champs notification
const NOTIFICATION_FIELDS = gql`
  fragment NotificationFields on Notification {
    id
    type
    titre
    message
    donnees
    estLu
    luLe
    createdAt
  }
`;

// ─── Queries ─────────────────────────────────────────

export const MES_NOTIFICATIONS = gql`
  ${NOTIFICATION_FIELDS}
  query MesNotifications($nonLuSeulement: Boolean, $limite: Int) {
    mesNotifications(nonLuSeulement: $nonLuSeulement, limite: $limite) {
      ...NotificationFields
    }
  }
`;

export const NOMBRE_NOTIFICATIONS_NON_LUES = gql`
  query NombreNotificationsNonLues {
    nombreNotificationsNonLues
  }
`;

// ─── Mutations ───────────────────────────────────────

export const MARK_NOTIFICATION_READ = gql`
  ${NOTIFICATION_FIELDS}
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id) {
      ...NotificationFields
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead
  }
`;

export const RESOLVE_ABSENCE_CONFLICT = gql`
  mutation ResolveAbsenceConflict($absenceId: ID!, $resolution: ConflictResolution!) {
    resolveAbsenceConflict(absenceId: $absenceId, resolution: $resolution)
  }
`;
