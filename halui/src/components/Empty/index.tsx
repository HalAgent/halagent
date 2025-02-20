import '../LoginTips/index.less';
const Empty: React.FC<{
  text?: string | React.ReactNode;
}> = ({ text }) => {
  return (
    <div className="login-tips">
      <div className="login-tips-title">{text || 'No Data'}</div>
    </div>
  );
};
export default Empty;
