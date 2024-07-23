import { useToastHandlers } from "@/hooks/useToaster";
import { useSetReset } from "@/store/authSlice";
import { ApiResponseError } from "@/types";
import { IoMdClose } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { HiBars3 } from "react-icons/hi2";
import Logo from "@/assets/Autogon-full-logo-3e48e82c 1.png";
import { Button } from "@/components/ui/button";
import { RxExit } from "react-icons/rx";

type HeaderProps = {
  showSideBarOnSM: boolean;
  showSideBar: boolean;
  setShow: (value: boolean) => void;
  setSidebarCollapsed: (value: boolean) => void;
  isSidebarCollapsed: boolean;
};

export const Header = (props: HeaderProps) => {
  const onResetState = useSetReset();
  const toastHandler = useToastHandlers();

  const navigate = useNavigate();

  const handleLogOut = async () => {
    const TOAST_TITTLE = "Account Access";
    try {
      onResetState();
      navigate("/");
    } catch (error) {
      toastHandler.error(TOAST_TITTLE, error as ApiResponseError);
    }
  };

  const toggleSidebar = () => {
    props.setSidebarCollapsed(!props.isSidebarCollapsed);
    props.setShow(!props.showSideBar);
  };

  return (
    <header className="py-3 px-5 flex items-center justify-between shadow-md">
      {props.showSideBarOnSM ? (
        <ToggleButton
          {...{ isSidebarCollapsed: props.isSidebarCollapsed, toggleSidebar }}
        />
      ) : (
        <SearchComponent />
      )}

      <div className="flex items-center">
        <Button className="bg-primary/20 text-primary rounded-full" size="icon">
          <RxExit onClick={handleLogOut} />
        </Button>
      </div>
    </header>
  );
};

const SearchComponent = () => {
  return (
    <div className="relative pl-4">
      <div className="w-80 ">
        <img src={Logo} />
      </div>
    </div>
  );
};

type ToggleButtonProps = {
  toggleSidebar: () => void;
  isSidebarCollapsed: boolean;
};

const ToggleButton = ({
  isSidebarCollapsed,
  toggleSidebar,
}: ToggleButtonProps) => {
  return (
    <div onClick={toggleSidebar} className={` cursor-pointer`}>
      {isSidebarCollapsed ? (
        <div className=" hover:bg-primary/40 rounded-full bg-gray-100  transition-colors duration-500 p-0.5">
          <IoMdClose size={28} />
        </div>
      ) : (
        <HiBars3 size={30} />
      )}
    </div>
  );
};
