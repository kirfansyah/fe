import { useContext } from "react"; 
import Header from "../components/Header"; 
import Footer from "../components/Footers/Footer";
import { SeekingContext } from "../contexts/SeekingContext";

const WebLayout = ({ children, contentRef }) => {

  const {stateSeeking} = useContext(SeekingContext)
  const sS = stateSeeking

  return (
    <>
      <Header />
      { sS.isModal ? <SeekingModal /> : <></> }
      <main className='h-screen-75 w-full select-none relative z-30 min-h-[720px]' ref={contentRef}>
        {children}
      </main>
      <Footer />
    </>
  );
};

export default WebLayout;
