import { Fragment } from "react";

const lines = ["Conversemos sobre tu", "próximo hogar."];

export function InvitationHeading() {
  return (
    <h2
      id="footer-invitation-title"
      className="invitation-heading"
      aria-label={lines.join(" ")}
    >
      {lines.map((line) => (
        <span className="invitation-line" aria-hidden="true" key={line}>
          {line.split(" ").map((word, index) => (
            <Fragment key={word}>
              {index > 0 && " "}
              <span className="invitation-word">
                {Array.from(word).map((character, position) => (
                  <span className="invitation-char" key={position}>
                    {character}
                  </span>
                ))}
              </span>
            </Fragment>
          ))}
        </span>
      ))}
    </h2>
  );
}
