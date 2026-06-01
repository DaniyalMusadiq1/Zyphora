import { useDispatch, useSelector } from 'react-redux';
import { setStreak } from '../redux/slices/streakSlice';

export function useStreak() {
  const slice = useSelector((s) => s.streak);
  const dispatch = useDispatch();
  return {
    data: slice.data,
    setStreak: (payload) => dispatch(setStreak(payload)),
  };
}
