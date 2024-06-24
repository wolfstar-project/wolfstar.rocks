import { styled } from '@mui/material/styles';
import { memo, type FC } from 'react';

import { keyframes } from '@mui/material';

const spin = keyframes`
0% {
	transform: rotate(0deg);
}
100% {
	transform: rotate(-360deg);
}
`;

const StyledSvg = styled('svg')({
	'&:hover': {
		animation: `${spin} 2s infinite cubic-bezier(0.65, 0.05, 0.36, 1)`
	}
});

const WolfStarLogo: FC = (props) => (
	<StyledSvg viewBox="0 0 250 250" {...props} height="32">
		<g>
			<g>
				<circle cx="125" cy="125" r="125" fill="black" />
				<path
					fill-rule="evenodd"
					clip-rule="evenodd"
					d="M151.357 26.0664C149.766 28.479 148.746 30.1179 144.89 36.4571C144.469 37.1494 142.572 40.2649 140.674 43.3803C135.867 51.2701 136.16 50.7854 131.431 58.6608C129.086 62.5648 127.168 65.8064 127.168 65.8643C127.168 65.9222 128.528 66.05 130.191 66.1485C133.97 66.3723 138.481 67.0669 142.497 68.0437C144.198 68.4576 145.735 68.7987 145.912 68.8017C146.331 68.8093 146.445 68.3601 147.267 63.4764C147.647 61.2161 148.406 56.7044 148.954 53.4505C149.502 50.1966 150.386 45.1552 150.919 42.2474C151.451 39.3397 152.1 35.6782 152.361 34.1107C152.623 32.5433 152.938 31.3538 153.063 31.4673C153.581 31.9396 155.225 35.2461 158.147 41.6961C162.667 51.6746 168.897 65.8904 169.641 67.9264C169.996 68.8956 171.03 71.5013 171.94 73.7167C172.85 75.9322 174.318 79.6971 175.203 82.0833C176.088 84.4696 176.887 86.4238 176.979 86.426C177.286 86.4338 178.9 82.4297 179.759 79.5292C181.298 74.332 181.5 73.008 181.646 67.1711L181.785 61.6325L179.299 58.4415C176.346 54.6531 168.08 44.3632 162.751 37.8417C160.658 35.2801 157.744 31.7115 156.277 29.9115C154.81 28.1114 153.26 26.2699 152.835 25.8192L152.06 25L151.357 26.0664ZM87.2319 30.1768C87.2347 30.8616 87.3565 32.4416 87.5025 33.6878C87.6484 34.934 88.0301 39.4089 88.3505 43.6321C88.6708 47.8553 89.1794 54.1995 89.4801 57.7303C89.781 61.2612 90.0508 65.1979 90.08 66.4788C90.109 67.7597 90.2519 68.8075 90.3973 68.8075C90.5427 68.8075 91.5938 68.0286 92.7327 67.0764C94.9696 65.2067 99.9883 61.6685 103.822 59.2585C110.285 55.1954 111.898 54.3284 118.237 51.5107C119.9 50.7716 121.257 50.0843 121.252 49.9833C121.247 49.8826 119.696 48.8975 117.806 47.7946C114.625 45.9379 111.392 43.9521 110.706 43.4327C110.382 43.1875 106.199 40.6712 100.306 37.1771C98.1404 35.8929 95.2357 34.1294 93.851 33.258C92.4666 32.3867 90.8321 31.4233 90.219 31.1169C89.6061 30.8107 88.6821 30.1937 88.1657 29.7458L87.2271 28.9316L87.2319 30.1768ZM124.636 55.0345C115.939 58.6165 106.075 63.8764 99.0961 68.6532C97.6572 69.638 96.0117 70.7629 95.4396 71.1529C94.8675 71.5428 94.0831 72.1108 93.6963 72.4151C93.3096 72.7195 92.0849 73.5712 90.9747 74.3076C89.0317 75.5966 88.8568 75.8035 86.3011 79.8427C84.8411 82.1505 83.1647 84.8317 82.576 85.8009C81.9873 86.7702 80.8484 88.5828 80.0457 89.829L78.5856 92.0948L77.9587 96.7522C77.116 103.013 76.325 107.622 76.0561 107.838C75.9349 107.936 74.2535 108.99 72.3197 110.18C70.386 111.37 67.728 113.031 66.4131 113.872C62.3704 116.455 49.4702 124.265 48.1305 124.94C46.9424 125.539 45.4286 126.453 35.1934 132.753C32.9511 134.133 31.0773 135.368 31.0292 135.497C30.9285 135.768 30.8236 135.735 35.5914 136.9C37.5904 137.389 39.5731 137.788 39.9972 137.788C40.4217 137.788 42.0772 137.235 43.6763 136.56C50.5542 133.653 51.652 133.237 52.2564 133.308C52.8898 133.382 52.8884 133.389 52.0621 134.232C51.6042 134.7 50.3896 136.512 49.3633 138.26C47.3989 141.607 46.4234 143.107 44.805 145.277C43.9547 146.416 43.8625 146.681 44.1302 147.207C44.6343 148.197 47.0096 150.99 47.5193 151.192C47.778 151.294 51.4073 152.131 55.5841 153.052C63.5874 154.815 65.7858 155.053 68.3158 154.427C69.8302 154.053 81.6371 148.993 95.6652 142.705C106.294 137.942 113.026 135.117 113.258 135.324C113.542 135.579 99.3605 146.173 95.8036 148.363C95.1086 148.791 94.5401 149.196 94.5401 149.264C94.5401 149.331 95.142 149.315 95.8776 149.227C97.478 149.037 102.859 149.486 105.466 150.027C110.252 151.021 115.696 153.421 118.87 155.937C120.251 157.031 121.487 157.929 121.615 157.929C121.845 157.929 122.824 155.721 124.016 152.516C125.418 148.749 126.203 143.978 125.913 140.998C125.805 139.89 125.649 138.828 125.568 138.638C125.486 138.447 125.542 138.292 125.692 138.292C126.076 138.292 127.591 141.618 128.283 143.982C128.603 145.075 129.051 147.319 129.28 148.968C129.508 150.617 129.749 152.015 129.816 152.075C130.098 152.327 139.545 145.686 139.541 145.239C139.536 144.729 136.629 141.454 134.492 139.549C132.18 137.49 128.557 134.887 125.902 133.378C124.974 132.851 123.689 132.1 123.048 131.708C121.549 130.794 116.514 128.675 113.164 127.548C108.48 125.973 99.8972 123.93 93.6263 122.896C91.654 122.571 90.0401 122.205 90.0401 122.081C90.0395 121.565 100.888 102.735 101.3 102.538C103.068 101.691 114.499 100.766 123.37 100.752C132.689 100.737 136.991 101.151 144.882 102.821C157.475 105.487 167.936 110.534 176.109 117.887C182.169 123.339 185.643 128.235 187.727 134.264C188.983 137.896 189.247 139.308 189.489 143.694L189.684 147.208L190.629 145.529C193.564 140.32 195.062 132.763 194.404 126.497C193.687 119.668 191.83 114.342 188.334 109.08C187.936 108.482 186.41 106.474 186.235 106.319C186.156 106.25 185.359 105.381 184.463 104.388C178.522 97.8106 168.984 92.0485 159.606 89.3718C152.858 87.4459 144.949 86.348 137.645 86.3228C134.667 86.3127 132.23 86.2475 132.23 86.178C132.23 85.9923 134.393 85.0212 136.168 84.4097C140.123 83.0477 153.415 82.3026 161.287 83.0017C163.732 83.2187 165.852 83.4626 165.998 83.5434C166.144 83.6245 166.26 83.5991 166.254 83.487C166.238 83.1734 164.161 82.0682 161.061 80.723C159.514 80.0519 157.805 79.2596 157.263 78.962C155.84 78.1803 149.932 76.0165 145.982 74.8302C142.014 73.6387 135.194 72.2077 132.371 71.9741C128.259 71.6337 121.112 73.0173 113.118 75.7021C110.418 76.6084 108.166 77.3115 108.113 77.2642C107.953 77.1199 109.359 74.5387 110.202 73.4297C111.941 71.1428 113.874 68.8289 115.762 66.7753C116.852 65.5883 118.188 64.1254 118.729 63.5239C119.271 62.9228 119.84 62.3077 119.995 62.1569C125.812 56.4952 128.536 53.7023 128.24 53.7023C128.037 53.7023 126.415 54.3017 124.636 55.0345ZM160.275 65.9584C159.959 66.4284 157.264 72.6802 157.268 72.9355C157.272 73.2026 164.275 76.7141 164.465 76.5442C164.553 76.4649 160.679 66.0002 160.499 65.8325C160.452 65.7887 160.352 65.8454 160.275 65.9584ZM188.317 69.5628C188.948 73.1432 189.115 74.9705 189.134 78.5001C189.152 81.906 189.056 82.8781 188.514 84.7934C187.229 89.3325 185.504 93.3943 183.892 95.6772C183.479 96.2631 183.14 96.8172 183.14 96.9091C183.14 97.0007 183.894 97.0052 184.815 96.9191C189.575 96.4738 200.198 98.009 205.568 99.9183C207.694 100.674 214.129 103.476 215.571 104.274C216.143 104.59 216.608 104.755 216.603 104.64C216.578 104.014 210.569 95.9834 203.355 86.9338C201.975 85.203 200.534 83.3904 200.154 82.9058C199.773 82.4211 198.922 81.3713 198.263 80.5727C197.603 79.7742 195.992 77.7916 194.683 76.167C192.431 73.3718 189.429 69.8875 188.559 69.0593C188.214 68.731 188.182 68.7967 188.317 69.5628ZM110.291 105.828C108.822 105.928 106.986 106.025 106.213 106.043L104.806 106.076L103.778 107.645C103.213 108.508 102.42 109.809 102.015 110.536C101.154 112.086 100.873 111.994 105.238 111.593C106.98 111.433 108.532 111.14 109.16 110.853C110.782 110.113 115.917 106.245 115.917 105.764C115.917 105.539 114.235 105.558 110.291 105.828ZM123.652 108.153C120.867 109.588 116.564 111.736 114.088 112.927C111.613 114.117 108.639 115.552 107.479 116.115C106.318 116.678 104.398 117.611 103.21 118.187C102.023 118.764 100.716 119.475 100.305 119.768L99.5591 120.3L102.605 120.764C107.285 121.475 115.531 123.343 119.95 124.693C132.883 128.642 143.517 134.221 151.578 141.284C153.066 142.588 154.241 143.439 154.308 143.261C154.557 142.609 155.284 139.853 155.686 138.04C156.66 133.652 156.818 131.975 156.813 126.082C156.809 120.682 156.73 119.638 156.065 116.263C155.657 114.186 155.129 111.915 154.893 111.217L154.463 109.946L151.574 109.134C145.052 107.299 137.568 106.014 131.527 105.693L128.715 105.543L123.652 108.153ZM193.547 106.277C193.547 106.434 194.465 107.111 195.587 107.78C201.535 111.331 205.474 114.148 210.796 118.655C213.229 120.715 220.158 126.967 221.108 127.958C221.433 128.299 222.359 129.21 223.164 129.984C225.365 132.101 227.644 134.729 229.384 137.159C229.583 137.436 230.027 138.059 230.372 138.543L231 139.425L230.834 136.152C230.743 134.352 230.484 132.143 230.259 131.243C228.682 124.947 228.161 123.591 225.926 119.961C224.52 117.678 221.518 114.452 219.284 112.823C215.758 110.253 210.098 108.131 203.66 106.966C199.611 106.233 193.547 105.82 193.547 106.277ZM198.439 117.548C198.842 119.243 200.017 128.364 200.018 129.803C200.019 131.979 201.223 139.144 202.121 142.32C202.532 143.774 203.502 146.663 204.277 148.739C205.547 152.145 206.46 154.169 209.446 160.194C210.294 161.906 212.322 166.402 212.786 167.6C213.053 168.289 213.354 167.883 214.074 165.859C215.44 162.024 216.044 159.4 216.598 154.907C216.915 152.334 216.3 145.327 215.479 142.168C213.213 133.451 208.717 126.065 201.728 119.58C200.709 118.635 199.514 117.627 199.071 117.34L198.266 116.818L198.439 117.548ZM163.17 118.974C163.17 119.037 163.489 119.982 163.878 121.074C165.324 125.128 165.785 127.797 165.808 132.25C165.832 136.716 165.468 138.979 164.181 142.395C163.805 143.392 163.415 144.57 163.315 145.012C163.215 145.454 162.698 146.326 162.167 146.948C161.636 147.571 161.201 148.183 161.201 148.308C161.201 148.735 155.571 154.138 153.159 156.025C151.015 157.702 146.304 160.823 144.702 161.627C143.959 162 143.726 161.818 144.044 161.113C145.229 158.48 148.998 146.419 148.715 146.165C148.633 146.092 147.264 146.959 145.672 148.091C144.081 149.223 141.259 151.123 139.403 152.313C137.546 153.503 135.25 155.027 134.3 155.699C133.35 156.371 132.49 156.922 132.389 156.922C131.718 156.922 123.351 163.126 119.328 166.607C115.095 170.271 111.495 174.36 108.821 178.543C105.68 183.456 103.047 190.29 101.873 196.573C101.692 197.542 101.286 199.624 100.97 201.198C100.39 204.093 100.194 208.947 100.506 212.678C100.638 214.253 100.725 214.461 101.353 214.692C101.738 214.835 102.245 215.094 102.48 215.27C103.233 215.832 103.666 215.368 104.366 213.248C107.328 204.277 113.888 195.753 123.511 188.368C125.319 186.981 131.702 182.852 132.039 182.852C132.135 182.852 133.642 182.047 135.387 181.063C137.131 180.079 140.268 178.492 142.356 177.537C146.338 175.716 146.624 175.576 149.975 173.796C152.134 172.649 156.462 170.12 158.67 168.716C159.959 167.896 164.367 164.552 166.405 162.848C167.024 162.33 167.942 161.621 168.445 161.272C171.384 159.232 175.301 153.098 176.689 148.362C177.212 146.578 177.128 140.304 176.547 137.788C175.275 132.274 171.777 126.518 166.858 121.843C165.766 120.805 163.17 118.786 163.17 118.974ZM194.049 152.438C188.912 158.202 185.198 162.893 183.383 165.91C182.9 166.713 181.683 168.649 180.678 170.212C179.673 171.776 178.924 173.12 179.012 173.199C179.317 173.472 184.62 170.388 186.902 168.61C192.672 164.116 194.821 160.44 195.931 153.17C196.172 151.592 196.317 150.254 196.254 150.197C196.191 150.14 195.198 151.149 194.049 152.438ZM87.649 154.794C84.7468 155.28 78.1927 156.917 75.1325 157.922C73.8175 158.354 71.6658 159.047 70.3508 159.462L67.96 160.217L65.1473 159.803C63.6003 159.575 62.1346 159.293 61.8899 159.176C61.6455 159.059 59.6204 158.556 57.3896 158.057C55.1591 157.559 53.1126 157.092 52.8417 157.019C52.5709 156.947 52.3495 156.991 52.3495 157.118C52.3495 157.436 56.5278 162.287 57.0161 162.535C58.0391 163.055 66.4299 165.733 67.0372 165.733C67.4155 165.733 69.1571 165.276 70.9075 164.717C76.7576 162.849 84.8807 161.045 90.7807 160.304C96.761 159.553 106.997 160.026 115.612 161.451C118.013 161.849 118.132 161.789 116.901 160.805C113.995 158.481 109.542 156.543 104.387 155.359C101.45 154.684 100.629 154.606 95.5246 154.517C91.3297 154.443 89.3271 154.514 87.649 154.794ZM102.965 166.272C99.6342 169.724 96.068 176.923 94.6895 182.978C94.1306 185.433 93.8192 191.976 94.1143 195.062C94.3674 197.709 94.3939 197.67 95.7358 192.671C96.7017 189.073 98.6413 184.043 99.9765 181.673C100.352 181.006 101.008 179.668 101.434 178.698C101.86 177.729 102.365 176.766 102.556 176.558C102.748 176.351 102.953 176.067 103.012 175.929C103.434 174.938 105.423 172.31 107.83 169.562C108.565 168.723 109.166 167.98 109.166 167.91C109.166 167.728 106.027 166.048 104.895 165.624C103.942 165.267 103.931 165.271 102.965 166.272ZM169.499 168.645C162.829 173.402 158.124 178.185 155.343 183.036C153.589 186.097 150.534 193.277 150.861 193.57C151.002 193.696 157.191 188.442 163.341 182.979C168.772 178.154 170.696 175.377 172.41 169.887C173.12 167.614 173.379 166.236 173.098 166.237C172.975 166.238 171.355 167.321 169.499 168.645ZM201.845 169.189C198.999 171.585 191.292 176.81 190.604 176.81C190.515 176.81 189.907 177.115 189.252 177.487C187.791 178.319 179.925 182.268 176.671 183.804C167.519 188.124 160.64 193.613 155.143 200.982C153.249 203.52 150.527 207.933 150.518 208.48C150.516 208.659 151.494 208.14 152.693 207.327C156.96 204.434 162.623 201.327 167.843 199.016C173.021 196.724 181.674 192.668 183.984 191.451C193.363 186.51 198.753 181.313 201.99 174.091C203.045 171.737 204.413 167.563 204.191 167.376C204.138 167.332 203.082 168.148 201.845 169.189ZM143.876 186.589C140.213 188.723 135.238 192.8 131.51 196.723C125.042 203.529 120.695 212.5 119.996 220.489C119.899 221.597 119.755 222.702 119.677 222.944C119.576 223.257 119.764 223.457 120.328 223.638C120.764 223.777 121.465 224.066 121.887 224.278C123.404 225.043 127.129 225.248 128.855 224.661C131.157 223.878 133.361 222.786 133.963 222.131C134.22 221.851 134.71 221.622 135.053 221.622C135.395 221.622 136.433 221.169 137.36 220.615C138.287 220.061 139.235 219.608 139.467 219.608C140.035 219.608 142.017 218.596 142.176 218.225C142.246 218.061 142.127 217.258 141.911 216.439C141.331 214.24 141.126 208.426 141.476 204.105C141.97 198.007 144.083 189.473 145.862 186.394C146.482 185.321 145.967 185.371 143.876 186.589Z"
					fill="white"
				/>
			</g>
		</g>
	</StyledSvg>
);

export default memo(WolfStarLogo);
