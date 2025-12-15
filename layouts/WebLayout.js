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
      
      <main className='flex-1 w-full select-none z-30 pb-6' ref={contentRef}> {/* ✅ Changed h-screen-75 to flex-1 */}
        {children}
      </main>
      
      <Footer absolute={false} />
    </>
  );
};

export default WebLayout;
