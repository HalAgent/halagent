import './index.less';
import { watchApi, WatchResponse } from '@/services/watch';
import { useEffect, useState } from 'react';
import { formatTimeDifference } from '@/utils/common';
import FooterOperation from '@/components/FooterOperation';

const WatchList = () => {
  const [data, setData] = useState<WatchResponse['items']>([]);
  const fetchData = async () => {
    const result = await watchApi.getMyWatchList();
    console.warn(result);

    setData(result);
  };
  const handleTranslate = (text: string, index: number) => {
    console.warn(text);

    setData(prevData => {
      const newData = [...prevData];
      newData[index].text = text;
      return newData;
    });
  };
  useEffect(() => {
    console.warn('watch list');
    watchApi.reset();
    fetchData();
  }, []);
  return (
    <div className="watch-list">
      <div className="watch-list-title">Watchlist</div>
      {data.map((item, index) => {
        return (
          <div className="watch-list-item" key={item.updatedAt}>
            <div className="watch-list-item-date">{formatTimeDifference(item.updatedAt)}</div>
            <div className="watch-list-item-title">{item.title}</div>
            <div className="watch-list-item-des">{item.text}</div>
            <FooterOperation
              text={item.text}
              onTranslate={text => {
                handleTranslate(text, index);
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default WatchList;
