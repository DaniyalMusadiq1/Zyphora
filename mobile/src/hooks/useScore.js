import { useDispatch, useSelector } from 'react-redux';
import { setScore } from '../redux/slices/scoreSlice';

export function useScore() {
  const slice = useSelector((s) => s.score);
  const dispatch = useDispatch();
  return {
    snapshot: slice.snapshot,
    lastSyncedAt: slice.lastSyncedAt,
    setScore: (payload) => dispatch(setScore(payload)),
  };
}
