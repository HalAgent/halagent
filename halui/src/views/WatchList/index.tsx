import './index.less';
import { watchApi, WatchResponse } from '@/services/watch';
import { useEffect, useState } from 'react';
import { formatTimeDifference } from '@/utils/common';
import FooterOperation from '@/components/FooterOperation';
import PixLoading from '@/components/common/PixLoading';
const isSelf = window.top === window.self;

const WatchList = () => {
  const [data, setData] = useState<WatchResponse['items']>([]);
  const [loading, setLoading] = useState(false);
  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await watchApi.getMyWatchList();
      console.warn(result);
      setData(result);
    } finally {
      setLoading(false);
    }
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
      {loading && isSelf && <PixLoading></PixLoading>}
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
