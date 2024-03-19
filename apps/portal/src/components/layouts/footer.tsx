const Footer = () => {
  return (
    <div className="bg-green-600 w-full p-3 text-white text-center z-20">
      <p className="text-sm font-semibold">
        Copyright @{new Date().getFullYear()} Kenya Institute of Public Policy
        Research and Analysis
      </p>
    </div>
  );
};

export default Footer;
