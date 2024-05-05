const Footer = () => {
  return (
    <div className="z-20 w-full p-3 text-center text-white bg-green-600">
      <p className="text-sm font-semibold">
        Copyright @{new Date().getFullYear()} Kenya Institute of Public Policy
        Research and Analysis
      </p>
    </div>
  );
};

export default Footer;
