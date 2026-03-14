const BackgroundDecorator = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
      <div className="absolute top-1/3 -left-48 w-[500px] h-[500px] rounded-full bg-primary/[0.03] blur-3xl" />
      <div className="absolute bottom-1/4 -right-48 w-[400px] h-[400px] rounded-full bg-primary-light/[0.03] blur-3xl" />
    </div>
  );
};

export default BackgroundDecorator;
