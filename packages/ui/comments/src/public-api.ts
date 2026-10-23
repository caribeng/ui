/*
 * Public API Surface de @caribeng/ui/comments
 */
export { CB_COMMENTS_TOOLBAR, CbComments } from './lib/comments.component';
export {
  mentionIds as cbCommentMentions,
  removeComment as cbRemoveComment,
  toggleReaction as cbToggleReaction,
  type CbActivity,
  type CbComment,
  type CbCommentEvent,
  type CbCommentPerson,
  type CbCommentReaction,
  type CbCommentReactionEvent,
  type CbCommentsFilter,
} from './lib/comments-model';
