import React, { useEffect } from "react";
import styled, { ThemeProvider, createGlobalStyle } from "styled-components";
import { backgroundColor, textColor } from "./theme";
import storage from "local-storage-fallback";
const ThemeToggleContext = React.createContext();

export const useTheme = () => React.useContext(ThemeToggleContext);

function getInitialTheme() {
	const savedTheme = storage.getItem("theme");
	return savedTheme ? JSON.parse(savedTheme) : { mode: "light" };
}
export const MyThemeProvider = ({ children }) => {
	const [themeState, setThemeState] = React.useState(getInitialTheme);
	useEffect(() => {
		storage.setItem("theme", JSON.stringify(themeState));
	}, [themeState]);

	// const Wrapper = styled.div`
	//   background-color: ${backgroundColor};
	//   color: ${textColor};
	// `;
	const GlobalStyle = createGlobalStyle`
  .EditorBackground{
    background-color: ${(props) =>
		props.theme.mode === "dark" ? "#3A3A3A" : "#DBDBDB"};
    color: ${(props) => (props.theme.mode === "dark" ? "#fff" : "#000")};
  }
  #nav> div, #nav>div> input, #navheading,#navsearch{
    background-color: ${(props) =>
		props.theme.mode === "dark" ? "#000" : "#fff"};
    color: ${(props) =>
		props.theme.mode === "dark" ? "#fff !important" : "#000"};
  }
  #home{
	background-color: ${(props) =>
		props.theme.mode === "dark" ? "#343434" : "#fff"};
    color: ${(props) =>
		props.theme.mode === "dark" ? "#fff !important" : "#000"};
	height:100vh;
  }
  .LoaderText{
	color: ${(props) =>
		props.theme.mode === "dark" ? "#fff !important" : "#000"};
  }
  #document{
	background-color: ${(props) =>
		props.theme.mode === "dark" ? "#4d4d4d" : "#fff"};
    color: ${(props) =>
		props.theme.mode === "dark" ? "#fff !important" : "#000"};
  }
  .fa-chevron-left{
	color: ${(props) =>
		props.theme.mode === "dark" ? "#fff !important" : "#000"};
  }
  `;

	const toggle = () => {
		const mode = themeState.mode === "light" ? `dark` : `light`;
		setThemeState({ mode: mode });
	};

	return (
		<ThemeToggleContext.Provider value={{ toggle: toggle }}>
			<ThemeProvider
				theme={{
					mode: themeState.mode,
				}}
			>
				<>
					<GlobalStyle />
					{children}
				</>
				{/* </Wrapper> */}
			</ThemeProvider>
		</ThemeToggleContext.Provider>
	);
};

export default ThemeProvider;
