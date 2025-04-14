import { useNavigate } from 'react-router-dom';
import { useStore } from 'services/store';
import { makeRequest } from 'services/query';

export const useDataLoader = () => {
  const navigate = useNavigate();
  const setTableOpen = useStore(state => state.setTableOpen);

  const loadCurrData = async (id, apiTable, currData, setCurrData) => {
    if (id) {
      try {
        const getData = await makeRequest('get', `${apiTable}?uuid=eq.${id}`, {}, {});
        setCurrData(getData[0]);
      } catch (error) {
        console.error('Could not load data for record:', error);
      }
    } else if (currData) {
      navigate(currData.uuid);
    } else {
      setTableOpen(true);
    }
  };

  const loadAllData = async (apiTable, setFunction) => {
    if (!apiTable) {
      return;
    }
    try {
      const getData = await makeRequest('get', apiTable, {}, {});
      setFunction(getData);
    } catch (error) {
      console.error('Could not load data for record:', error);
    }
  };

  return { loadCurrData, loadAllData };
};
